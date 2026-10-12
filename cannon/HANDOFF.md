# CharlieNet Cannon Fleet — Agent Handoff

Audience: an AI agent with no prior context on this system. Read fully before acting on anything named here. This document states what exists, why, what it touches directly, and what it affects downstream. It separates verified facts from assumptions and flags the current blockers.

Last updated: 2026-07 (session that built the fleet). Repo: `Vagblasterxl/r2-explorer-template`, branch `claude/document-skills-2hT6I`, directory `cannon/`.

---

## 1. What it is (one paragraph)

A "cannon" is a scheduled AI agent loop that pulls tasks from a shared Cloudflare D1 database, executes them in batches ("salvos"), records telemetry, refills its own task queue, and schedules its own next run. A "forge" (`cannon/forge.mjs`) generates cannons from small JSON config files. There are 6 cannons defined, each pointed at a different work domain, all sharing one database and one execution engine. The system is a **work-queue autopilot**: given a topic and a pool of tasks, it keeps doing the work until paused or drained.

This is not a product, a service, or a web app. It is a set of **prompts + SQL + a code generator** that drive an agent (or agents) to do work on a schedule.

---

## 2. Why it exists (intent)

The operator is a solo individual (sole admin of their own Google Workspace, Cloudflare-purchased domain). The goal is to saturate several build/hardening domains with continuous, unattended-or-semi-attended agent work, without hand-writing each task every time. The forge exists so a new work-domain becomes one config file, not a rewrite. The pool-hydrator mechanism exists so the queue never empties on its own.

Origin: evolved from a single "task cannon" prompt (the SUPERMAX cannon, targeting Claude Code + Cowork) into a fleet of 6 domain-specific cannons plus a generator.

---

## 3. Components (what's in the repo)

| Path | What it is |
|------|-----------|
| `cannon/forge.mjs` | Zero-dependency Node generator. Reads `cannons/*.json`, writes `dist/<name>.sql` + `dist/<name>-PROMPT.md`. |
| `cannon/schema.sql` | The "fresh install" schema: `task_pool`, `events`, `cannon_state`. |
| `cannon/cannons/*.json` | One config per cannon (fortress, conduit, ledger, relay, bastion, overmind). Each has: instance_target, focus, salvo_size, max_chain_depth, d1_id, hydrator_prompt, tasks[]. |
| `cannon/dist/<name>.sql` | Generated pool-load: sets control flags, clears that instance's tasks, inserts hydrator + tasks. |
| `cannon/dist/<name>-PROMPT.md` | Generated "fire prompt" — the instructions an agent runs each time the cannon fires. |
| `cannon/README.md` | How the forge works and how to deploy. |
| `CHARLIENET-CANNON-SUPERMAX.md` (repo root) | The original SUPERMAX cannon (Claude Code + Cowork), authored by hand. |
| `CHARLIENET-CANNON-LINEUP.md` (repo root) | The research + rationale behind the 6 targets. |

---

## 4. The database (shared state — this is the source of truth)

- **Cloudflare account**: Kenwsimmons@hotmail.com — account_id `ab02f4dfa746bf2e6b3d9ff634bb135a`
- **D1 database**: name `charlienet-db`, id `6f02151e-7a24-4cdd-95be-9722faefce77`
- **Three tables:**
  - `task_pool` — the queue. Key columns: `id, task_name, prompt, category, instance_target, priority, status, estimated_minutes, created_at, claimed_at, completed_at, failed_at, scheduled_for, claimed_by, duration_seconds, retry_count, failure_reason, depends_on, output, tags`. `status` ∈ {waiting, running, completed, failed, paused}. Rows are partitioned by `instance_target` (one value per cannon).
  - `events` — append-only telemetry. Columns: `id, event_type, source, agent_id, task_id, payload, created_at`. `source` = the cannon's instance_target. Event types include: `cannon.fired`, `cannon.completed`, `cannon.task_failed`, `cannon.salvo_complete`, `cannon.pool_empty`, `cannon.paused`, `cannon.runaway_detected`, `pool.hydrated`.
  - `cannon_state` — control flags, one row per key, keys namespaced by cannon. Per cannon: `<name>_paused` (false/true), `<name>_focus`, `<name>_max_chain_depth`, `<name>_chain_depth_today`, `<name>_salvo_size`, `<name>_last_fire`.

**Important pre-existing data**: `task_pool` already contained a pool under `instance_target='any'` (47 waiting + 32 completed at last check) that predates this fleet and belongs to a different/earlier process. **Do not modify or claim `any` rows.** The 6 cannons here use their own instance_target values and never touch `any`.

**Schema note**: the live `charlienet-db` table was originally simpler than `schema.sql`. An **additive migration** was applied (added the columns from `claimed_by` onward, created `cannon_state`, added indexes). No existing rows were altered or deleted. `schema.sql` in the repo is the from-scratch version; a fresh DB uses it directly, the live DB was migrated to match.

---

## 5. The 6 cannons (current loaded state)

All 6 are **loaded into the live database and paused-capable but NOT firing** (no scheduler is running them yet — see §8). Each has a priority-1 `pool-hydrator` task plus its work tasks.

| instance_target | Domain | Waiting tasks | salvo_size | Destructive? |
|-----------------|--------|--------------:|-----------:|--------------|
| `fortress` | Security & identity hardening (Google Workspace, DNS, DMARC, MFA, OAuth, secrets) | 14 | 4 | **YES — high** |
| `conduit` | Cloudflare platform buildout (Workers, R2, D1, MCP, AI Gateway, Email Service) | 13 | 5 | Medium |
| `ledger` | Knowledge/memory layer (NotebookLM, Mem.ai, Workspace Studio, R2 as system of record) | 11 | 4 | Low |
| `relay` | Slack internal bot + comms bridge (Slack, Google Workspace, cannon control) | 11 | 4 | Medium |
| `bastion` | Bare-metal / self-hosted sovereignty (reverse proxy, tunnels, Nextcloud, backups) | 10 | 3 | Medium |
| `overmind` | Fleet orchestration (dashboards, balancing, cross-cannon triggers) | 9 | 3 | Medium |

Plus the pre-existing SUPERMAX concept (`CHARLIENET-CANNON-SUPERMAX.md`) targeting Claude Code + Cowork, which uses its own instance_target and is documented separately.

---

## 6. The execution engine (what an agent does each fire)

Every cannon runs the same 6-phase loop (full text in `dist/<name>-PROMPT.md`):

1. **Pre-flight** — log a `cannon.fired` event; check `<name>_paused` (if true, log and exit without working); reap "zombie" tasks stuck in `running` >15 min back to `waiting` (or to `failed` after 3 retries).
2. **Salvo claim** — atomically claim up to `salvo_size` waiting tasks using a compare-and-swap (`UPDATE ... WHERE status='waiting' RETURNING`), so two concurrent fires can't grab the same task.
3. **Execute** — run each claimed task's prompt verbatim; spawn sub-agents for large tasks; parallelize independent tasks; write results to the `output` column. **Security guard**: a task must never weaken a control to "pass" (no disabling MFA, exposing secrets, opening firewalls); if it would require that, it fails with reason `refused_unsafe`.
4. **Salvo summary** — log a `cannon.salvo_complete` event with counts.
5. **Empty pool** — if nothing to claim, log `cannon.pool_empty` (the hydrator should prevent this).
6. **Chain next fire** — pick an interval by outcome (clean full salvo → ~90s; partial → ~3min; empty → ~10min; all-failed → ~5min; paused → ~30min), enforce a runaway guard (stop if `<name>_chain_depth_today` ≥ `max_chain_depth`), then schedule the next fire.

**Pool never drains**: the priority-1 `pool-hydrator` runs every salvo and refills its own queue with new on-topic tasks, then re-queues itself.

---

## 7. What it affects — directly and downstream

### Directly (when a cannon actually runs)
- **The database** (`charlienet-db`): reads/writes `task_pool`, appends to `events`, updates `cannon_state`. This is always affected.
- **The repo**: tasks that touch code commit/push to `claude/*` branches.
- **Per-domain external systems**, depending on which cannon runs:
  - `fortress` → **the operator's real Google Workspace admin settings, Cloudflare DNS zone, and email authentication (DMARC/SPF/DKIM), OAuth grants, and live secrets.** These are production identity/mail changes.
  - `conduit` → Cloudflare account resources (Workers, R2 buckets, D1, AI Gateway, MCP config).
  - `ledger` → NotebookLM notebooks, Mem.ai notes, Google Workspace Studio flows, R2 objects.
  - `relay` → a Slack workspace (app/bot creation, event subscriptions), Google Workspace↔Slack integrations.
  - `bastion` → a self-hosted/bare-metal host (OS config, Docker, reverse proxy, backups, Cloudflare Tunnel).
  - `overmind` → the other cannons' pools and schedules (it can enqueue tasks into other instances and trigger their fires).

### Downstream (second-order effects)
- **Mail deliverability**: `fortress` DMARC progression (none → quarantine → reject) changes whether the operator's outbound mail is accepted by receivers. Wrong sequencing → legitimate mail rejected.
- **Access/lockout**: `fortress` identity changes (MFA enforcement, killing SMS, OAuth revocation) on a **sole-admin account** can lock the operator out of everything if mis-ordered. The break-glass-admin task exists specifically to reduce this risk and should run/verify before the others.
- **Credit/compute consumption**: any firing cannon consumes AI credits continuously until paused, drained, or runaway-capped. Six cannons firing = six loops.
- **Cross-cannon cascades**: `overmind` can enqueue work into other pools and fire other cannons. A rule there propagates work fleet-wide.
- **Cost visibility**: `conduit`'s AI Gateway task, once done, is what makes token/$ spend observable; until then, spend is not centrally metered.
- **Dependencies between cannons**: FORTRESS secrets work should precede CONDUIT wiring; CONDUIT AI Gateway precedes RELAY's AI panel; LEDGER's R2-system-of-record precedes its knowledge sync. `overmind`'s dependency-graph task is meant to encode/enforce this.

---

## 8. Current state, blockers, and what is NOT true

- **NOT firing.** All 6 pools are loaded; nothing is scheduled to run them. The system is inert until a scheduler fires a cannon's prompt.
- **Scheduler mismatch.** The fire prompts reference `create_scheduled_task` — that is the operator's own CharlieNet/Workers scheduling tool, not part of any specific AI environment. In a Claude Code environment the equivalent is a cron/Routine, whose minimum interval is hourly (not the 90s–3min the prompt describes). Whoever ignites must map "schedule next fire" onto whatever scheduler they actually have.
- **Cloudflare access is intermittent / requires auth.** The Cloudflare Developer Platform connector must be authenticated in the session that runs a cannon, or the cannon cannot reach `charlienet-db`. Non-interactive sessions cannot complete that OAuth. If a fire happens without DB access, it can do no useful work.
- **FORTRESS is the high-risk cannon.** It mutates the operator's real, sole-admin identity/DNS/email. Recommended posture: run it **approval-gated** (auto-do audits/docs/staging; pause for human confirmation before DMARC reject, OAuth revocation, MFA/SMS changes, secret rotation) rather than full autopilot.
- **Two external integrations are early/fragile** (from `ledger`): Mem.ai's outflow/OAuth is not fully shipped (treat Mem as write-only for now); `notebooklm-py` uses undocumented Google endpoints (can break without notice; personal/prototype use only). The official NotebookLM Enterprise API is the stable path.

---

## 9. Cross-reference / logical validation

Consistency checks performed on this system:

- **No instance_target collision.** The 6 cannons use distinct instance_target values; none is `any`; the pre-existing `any` pool is untouched by any cannon's DELETE (each `dist/<name>.sql` only deletes `WHERE instance_target='<name>'`). ✔
- **Schema compatibility.** Every column the fire prompts read/write (`retry_count`, `claimed_by`, `duration_seconds`, `failed_at`, `scheduled_for`, `failure_reason`, `output`, `depends_on`, `tags`) exists after the additive migration. Verified the generated SQL parses and loads in a real SQLite engine (68 rows across the fleet, every hydrator present, zero empty prompts). ✔
- **Atomicity.** Salvo claim uses compare-and-swap; concurrent fires cannot double-claim a task. ✔ (design-level; not stress-tested under real concurrency)
- **Termination guards.** Each cannon has a `max_chain_depth` runaway cap and a zombie reaper; `overmind` has a lower cap (500) than the others (1000). ✔
- **Safety invariant.** Security tasks are instructed never to weaken a control to pass; failures are logged, not forced. ✔ (prompt-level instruction, not a hard technical enforcement — an agent must honor it)
- **Grounding.** The task targets were checked against mid-2026 external reality (Google Workspace 2–4 super-admin guidance; DMARC enforcement mandatory; Cloudflare Agents Week features — Code Mode, AI Gateway, Sandboxes, Email Service; Slack classic-app retirement; Mem/NotebookLM API states). These are point-in-time facts and may drift; re-verify before acting on any single one.

Known soft spots an agent should treat with caution:
- The `refused_unsafe` guard and the approval-gating are **prompt instructions**, not enforced by code. An executing agent must actually respect them.
- Interval mapping (90s/3min/etc.) assumes a fine-grained scheduler; on hourly-minimum schedulers the cadence is coarser and the "hot streak" concept doesn't apply.
- FORTRESS destructive tasks have ordering gates written into their prompts (e.g. don't go to DMARC reject until quarantine is clean), but nothing technically prevents an agent from running them out of order — the agent must read and honor the gates.

---

## 10. How another agent should interact with this

- **To observe** (safe, read-only): query `task_pool` grouped by `instance_target, status`; read recent `events` by `source`; read `cannon_state`. Requires Cloudflare D1 access to `charlienet-db` (account `ab02f4dfa746bf2e6b3d9ff634bb135a`).
- **To pause a cannon**: `UPDATE cannon_state SET value='true' WHERE key='<name>_paused'`.
- **To stop the chain**: set `<name>_chain_depth_today` to its `max_chain_depth` (trips the runaway guard).
- **To add a cannon**: drop a JSON in `cannon/cannons/`, run `node forge.mjs <file>`, apply `dist/<name>.sql`, ignite its prompt.
- **Do NOT**: touch `instance_target='any'`; force a destructive FORTRESS task past its gate; ignite full autopilot on FORTRESS without the operator's explicit approval; assume Cloudflare access is present without checking.

---

## 11. Open decisions for the operator's other agents to weigh in on

1. Ignition path: the operator's own `create_scheduled_task` infra vs. an environment cron (hourly-min). Which scheduler actually runs these?
2. FORTRESS posture: approval-gated (recommended) vs. full autopilot.
3. Whether to ignite cannons individually and serially (recommended: FORTRESS-gated first, verify, then CONDUIT, etc.) or in parallel.
4. Whether OVERMIND's cross-cannon triggers should be enabled now or after the individual cannons are proven.
