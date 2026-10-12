# CharlieNet Cannon Fleet V2 — Agent-Native, Bare-Metal, Minimal Wiring

Date: 2026-10. Supersedes the V1 scheduler model (create_scheduled_task chains, env crons). V1 docs remain valid for the data layer; this changes **who fires and where work runs**.

## The V2 thesis

V1's weakness was wiring: a self-chaining scheduler, per-environment cron minimums, OAuth-bound MCP sessions. V2 deletes nearly all of it. The entire moving-parts inventory is:

1. **One bare-metal box** (the BASTION host) — the conductor.
2. **One systemd timer + one script** (`pulse.sh`) — the only scheduler that exists.
3. **One database** — still `charlienet-db` (D1, id `6f02151e-7a24-4cdd-95be-9722faefce77`) as the fleet's source of truth, accessed via `wrangler d1 execute` with an API token on the box (no interactive OAuth, no MCP session dependency — this kills V1's biggest blocker).
4. **Headless agent sessions as the workers** — each salvo is a `claude -p` (or cloud session) launched by the pulse. No self-chaining prompts. The cannon prompt shrinks to phases 1–5; phase 6 (chain-the-next-fire) is deleted because the timer IS the chain.

Everything else — forge, configs, pools, hydrators, control flags, events telemetry, the `any`-pool landmine, the FORTRESS approval gates — carries over unchanged.

## Architecture (one screen)

```
systemd timer (every 5 min)
  └─ pulse.sh
       ├─ for each cannon (fortress conduit ledger relay bastion overmind):
       │    ├─ skip if <name>_paused='true'            (one wrangler d1 query)
       │    ├─ skip if a worker for <name> still alive  (pidfile)
       │    └─ launch: claude -p "$(cat dist/<name>-PROMPT-v2.md)" \
       │              --allowedTools Bash,Read,Write,Edit,Glob,Grep \
       │              --max-turns 80  >> /var/log/cannon/<name>.log &
       └─ exit. The timer re-fires; concurrency is bounded by pidfiles.
```

Why this is better than V1, point by point:
- **No OAuth cliff.** The box holds a scoped Cloudflare API token (D1 read/write on one DB only, stored in the BASTION vault). Headless sessions shell out to `wrangler` — works at 3 a.m., unattended, forever.
- **No chain to break.** V1's "schedule next fire before final message" invariant is gone; a crashed worker just means the next pulse relaunches. The zombie reaper already handles half-done salvos.
- **Real cadence.** 5-minute pulses with per-cannon pidfiles ≈ V1's adaptive 3-min default, without any scheduler API at all.
- **Bounded blast radius.** One box, one token, one log dir. Pull the token or `systemctl stop cannon-pulse.timer` and the entire fleet is dead-stopped — a physical kill switch V1 never had.

## Cloud-task mapping (for when workers should NOT run locally)

The pulse can route any cannon to a **cloud session instead of a local one**: same prompt, launched as a Claude Code cloud task (web/`&`-backgrounded session on Anthropic's infra). Routing rule, encoded as a `<name>_runner` key in `cannon_state` (`local` | `cloud`):
- `bastion` → **local always** (it configures the very box it runs on).
- `fortress` → **cloud, approval-gated** (identity/DNS work wants the audited, resumable session trail; destructive steps still pause for the operator per the V1 gates).
- `conduit`, `ledger`, `relay`, `overmind`, `supermax` → **cloud by default** (pure API work; keeps the metal's cores free), falling back to local when offline — which is the sovereignty case bare metal exists for.

OVERMIND's trigger primitives get simpler too: "fire cannon X now" = touch `/run/cannon/fire-now.<x>`, which the next pulse honors immediately. Cross-pool enqueue stays a plain D1 INSERT. No scheduler API anywhere.

## pulse.sh (reference, ~40 lines, the only wiring in the system)

```bash
#!/usr/bin/env bash
set -euo pipefail
DB=charlienet-db; CANNONS="fortress conduit ledger relay bastion overmind"
RUN=/run/cannon; LOG=/var/log/cannon; mkdir -p "$RUN" "$LOG"
q(){ npx wrangler d1 execute "$DB" --remote --json --command "$1"; }
for c in $CANNONS; do
  [ -f "$RUN/$c.pid" ] && kill -0 "$(cat "$RUN/$c.pid")" 2>/dev/null && continue
  paused=$(q "SELECT value FROM cannon_state WHERE key='${c}_paused'" | jq -r '.[0].results[0].value // "false"')
  [ "$paused" = "true" ] && [ ! -f "$RUN/fire-now.$c" ] && continue
  rm -f "$RUN/fire-now.$c"
  ( claude -p "$(cat "$HOME/cannon/dist/${c}-PROMPT-v2.md")" \
      --allowedTools "Bash,Read,Write,Edit,Glob,Grep" --max-turns 80 \
      >>"$LOG/$c.log" 2>&1 ) & echo $! > "$RUN/$c.pid"
done
```
Install: `cannon-pulse.service` (oneshot, runs the script) + `cannon-pulse.timer` (`OnCalendar=*:0/5`), token in the vault, `wrangler` authed via `CLOUDFLARE_API_TOKEN` env from systemd `LoadCredential`. That is the complete deployment.

## V1 → V2 migration map

| V1 piece | V2 fate |
|---|---|
| Fire-prompt phases 1–5 | **Unchanged** (becomes `dist/<name>-PROMPT-v2.md`, forge gains a `--v2` flag that simply omits phase 6) |
| Phase 6 self-chain / create_scheduled_task | **Deleted** — systemd timer is the chain |
| Chain-depth runaway guard | Kept, now enforced by pulse (count `cannon.fired` events today, skip if ≥ cap) |
| MCP OAuth for D1 | **Replaced** by scoped API token + wrangler on the box |
| D1 schema, pools, hydrators, flags, events | **Unchanged** — all 68+ loaded tasks remain valid |
| FORTRESS approval gates | **Unchanged and still mandatory** — gated steps write a `pending_approval` row and stop; the operator approves via one UPDATE (or the RELAY Slack button once built) |
| `any` pool | **Still untouchable** |

## Ignition order (unchanged in spirit, now trivial to execute)

1. Put the scoped D1 token on the box; install timer; all cannons start `paused='true'`.
2. Unpause **fortress** only; watch two salvos in `fortress.log` + the events table.
3. Unpause conduit → ledger → relay → bastion, one per day, reading the logs.
4. Enable overmind last, after a week of clean telemetry.

Kill switches, strongest first: `systemctl stop cannon-pulse.timer` (fleet-wide, instant) → revoke the API token (fleet-wide, survives box compromise) → `<name>_paused` flag (per-cannon) → chain-depth cap (per-cannon, automatic).

## What this affects (delta from V1 handoff §7)

Direct: adds the bare-metal host itself (systemd units, `/run/cannon`, `/var/log/cannon`, a vault-held Cloudflare token) and, for cloud-routed cannons, Claude cloud sessions on the operator's account. Downstream: credit burn is now governed by pulse cadence × max-turns — two numbers in one file — instead of an emergent chain; auditability improves (every salvo is a log file plus, for cloud runs, a resumable session). Risk posture strictly improves: fewer trust boundaries, one revocable credential, physical off-switch.

## Addendum: the cloud-agent primitives are real (verified 2026-10-12)

This session confirmed the Claude Code Remote API surface exists and is callable. The V2 concepts map 1:1 onto named primitives — no custom scheduler code needed for the cloud half:

| V2 concept | Real primitive |
|---|---|
| Cloud worker session per salvo | `create_session` (fresh session, inherits or names an environment, takes an initial prompt, can push to an `outcome_branch`) |
| The pulse (cloud-side alternative to systemd) | `create_trigger` with `create_new_session_on_fire=true` + cron — each firing spawns a clean session running the cannon prompt; `connectors` can attach Cloudflare D1 access to every future firing |
| OVERMIND's fire-cannon trigger | `fire_trigger` — fires a Routine immediately, outside schedule, with run-specific context text appended. This is exactly the primitive the overmind pool task describes; it already exists |
| One-shot delayed work | `send_later` / `run_once_at` Routines |
| Inbound events waking a session (webhook-receiver → agent) | `watch_url` — mints an inbound webhook URL whose POSTs wake the session; pairs with the existing webhook-receiver worker for a zero-polling event path |
| Fleet oversight | `list_sessions` / `get_session` / `interrupt_session` / `archive_session` — OVERMIND can observe, steer, pause, and retire worker sessions directly |

**Revised recommendation**: run the fleet **dual-plane**. Cloud plane = Routines (`create_trigger`, fresh-session-per-fire, hourly-jittered crons, one per cloud-routed cannon) with the Cloudflare connector attached at creation so fired sessions reach D1 without OAuth friction. Metal plane = the systemd pulse for `bastion` and as the offline/sovereignty fallback for everything else. Both planes read and write the same `task_pool`/`events`/`cannon_state`, and the CAS salvo claim already makes them safe to run simultaneously — a cloud fire and a metal fire can never double-claim a task. The bare-metal box stops being the only conductor and becomes the failsafe conductor, which is the correct sovereignty posture: cloud for throughput, metal for continuity.

Ignition remains a deliberate act: one `create_trigger` call per cannon, FORTRESS last and approval-gated, each confirmable and deletable (`delete_trigger`) in one call. Nothing in this addendum fires anything by itself.

## Honest unknowns (verify before trusting)

- `wrangler d1 execute --remote` token scoping: confirm a D1-only token suffices for your wrangler version; test read+write before unpausing anything.
- Headless `claude -p` tool allowances and `--max-turns` flags: confirm against the installed CLI version on the box.
- Cloud-session routing: launch mechanics for programmatic cloud tasks evolve quickly; pin whatever the CLI on the box actually supports and note it in `cannon_state` (`fleet_cli_version`).
