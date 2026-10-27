# CharlieNet Cannon Forge

A standalone, zero-dependency tool that generates **self-perpetuating task cannons** from small config files. One engine, many cannons — each pointed at a different saturation target.

> A "cannon" is a scheduled AI task that fires in salvos: it atomically claims a batch of tasks from a D1 pool, executes them, logs telemetry, keeps its own pool hydrated, and schedules its own next fire. It runs until you pause it or its pool drains.

---

## Why this exists

Hand-writing each cannon (schema + task pool + the ~140-line fire prompt) is repetitive and error-prone. The forge turns the boilerplate into a template and lets each cannon be described by a **config**: its focus, its hydrator, and its list of tasks. Change the config, re-run the forge, redeploy. That's it.

Six cannons ship in `cannons/`. Add a seventh by dropping in one JSON file.

---

## Layout

```
cannon/
├── forge.mjs            # THE TOOL — zero-dep Node generator
├── schema.sql           # shared D1 schema (task_pool, events, cannon_state) — apply once
├── cannons/             # one config per cannon (edit these)
│   ├── fortress.json    # security & identity hardening   (build first)
│   ├── conduit.json     # Cloudflare platform buildout
│   ├── ledger.json      # NotebookLM / Mem.ai memory layer
│   ├── relay.json       # Slack internal bot + comms bridge
│   ├── bastion.json     # bare-metal / self-hosted sovereignty
│   └── overmind.json    # fleet orchestration + trigger tasks
└── dist/                # GENERATED — do not hand-edit
    ├── <name>.sql        # control flags + pool load (INSERTs)
    └── <name>-PROMPT.md  # the fire prompt to paste into create_scheduled_task
```

---

## How it works (the whole model in one page)

### 1. Three shared tables (`schema.sql`)
- **`task_pool`** — the queue. Every cannon's tasks live here, separated by `instance_target` (`fortress`, `conduit`, …).
- **`events`** — telemetry. Every fire, salvo, completion, and failure is logged, tagged by `source`.
- **`cannon_state`** — control flags, namespaced per cannon: `fortress_paused`, `conduit_chain_depth_today`, etc.

Apply it **once** per database; all cannons share it.

### 2. A config describes a cannon (`cannons/*.json`)
```jsonc
{
  "instance_target": "fortress",     // unique key; separates this cannon's rows
  "display_name": "FORTRESS",
  "focus": "security and identity hardening …",
  "salvo_size": 4,                    // tasks claimed+executed per fire
  "max_chain_depth": 1000,            // runaway guard: fires/day before hard stop
  "d1_id": "<SET_D1_ID>",            // your D1 database id
  "hydrator_prompt": "Keep the pool >=15 …",  // the perpetual pool-filler
  "tasks": [
    { "name": "...", "prompt": "...", "category": "...", "priority": 10, "estimated_minutes": 20 }
  ]
}
```

### 3. The forge generates two artifacts per cannon
- **`dist/<name>.sql`** — sets the control flags and loads the pool (the priority-1 **hydrator** plus every task). Idempotent: it clears this instance's old tasks first.
- **`dist/<name>-PROMPT.md`** — the fire prompt, with the cannon's name/focus/salvo size baked in. This is what actually runs.

### 4. The fire prompt is a 6-phase loop
Every cannon runs the identical engine (only the target differs):

1. **Pre-flight** — log the fire; check the pause flag; reap zombie tasks (stuck >15 min).
2. **Salvo claim** — atomically grab up to `salvo_size` tasks with a compare-and-swap (`UPDATE … WHERE status='waiting' RETURNING`). Two fires can't grab the same task.
3. **Execute** — run each task's prompt verbatim; spawn sub-agents for big ones; parallelize independent ones; hand outputs forward. **Security tasks never weaken a control to "pass."**
4. **Salvo summary** — log what happened.
5. **Empty pool** — if nothing to claim, log it (the hydrator should prevent this) and back off.
6. **Chain the next fire** — schedule the next run *before* replying, with an adaptive interval, guarded by the runaway limit.

### 5. The pool never runs dry
Each cannon's **priority-1 `pool-hydrator`** task runs every salvo, tops the pool back up with fresh on-topic tasks, and re-queues itself. Saturation continues until you redirect it.

---

## Usage

### Forge
```bash
node forge.mjs --all                    # generate every cannon
node forge.mjs cannons/fortress.json    # generate just one
node forge.mjs --help
```
No `npm install`. No network. Just Node ≥ 18.

### Deploy a cannon
```bash
# 1. Set your D1 id in the config(s), then re-forge
#    (edit cannons/*.json "d1_id", or leave <SET_D1_ID> and fill in the prompt later)

# 2. Apply the shared schema once
npx wrangler d1 execute <YOUR_DB> --file=schema.sql

# 3. Load a cannon's pool
npx wrangler d1 execute <YOUR_DB> --file=dist/fortress.sql

# 4. Ignite: paste dist/fortress-PROMPT.md's prompt block into create_scheduled_task
#    (fireAt = ~1 minute out). It self-perpetuates from there.
```

### Verify locally (no Cloudflare needed)
```bash
python3 - <<'PY'
import sqlite3, glob, os
con = sqlite3.connect(":memory:")
con.executescript(open("schema.sql").read())
for f in sorted(glob.glob("dist/*.sql")):
    con.executescript(open(f).read())
    name = os.path.basename(f)[:-4]
    n = con.execute("SELECT COUNT(*) FROM task_pool WHERE instance_target=?", (name,)).fetchone()[0]
    print(name, n, "tasks")
PY
```

---

## Operating a running cannon

```sql
-- Pause (chain keeps alive, task execution stops)
UPDATE cannon_state SET value='true'  WHERE key='fortress_paused';
-- Resume
UPDATE cannon_state SET value='false' WHERE key='fortress_paused';

-- Hard-stop the chain (trips the runaway guard)
UPDATE cannon_state SET value='1000'  WHERE key='fortress_chain_depth_today';
-- Daily reset (or after a manual stop)
UPDATE cannon_state SET value='0'     WHERE key='fortress_chain_depth_today';

-- Retry everything that failed
UPDATE task_pool SET status='waiting', retry_count=0, failure_reason=NULL, failed_at=NULL
WHERE instance_target='fortress' AND status='failed';
```

### Watch the fleet
```sql
-- Depth + status per cannon
SELECT instance_target, status, COUNT(*) FROM task_pool GROUP BY 1,2 ORDER BY 1,2;
-- Recent activity
SELECT created_at, source, event_type, task_id FROM events ORDER BY id DESC LIMIT 30;
-- Heartbeat (each should fire every few minutes when active)
SELECT source, MAX(created_at) FROM events WHERE event_type='cannon.fired' GROUP BY source;
```

---

## The fleet

| Cannon | instance_target | Focus | Build order |
|--------|-----------------|-------|-------------|
| SUPERMAX | `supermax` | Claude Code + Cowork | already built (root doc) |
| **FORTRESS** | `fortress` | Security & identity hardening | **1 — do first** |
| CONDUIT | `conduit` | Cloudflare platform (Workers/R2/D1/MCP/AI Gateway) | 2 |
| LEDGER | `ledger` | NotebookLM + Mem.ai memory layer | 3 |
| RELAY | `relay` | Slack internal bot + comms bridge | 4 |
| BASTION | `bastion` | Bare-metal / self-hosted sovereignty | 5 |
| OVERMIND | `overmind` | Fleet orchestration + trigger tasks | 6 — last |

**Build FORTRESS first.** Everything sits on your identity + domain; the single-super-admin lockout risk and un-enforced DMARC are fixed there before anything else is built on top.

Each cannon's tasks are grounded in verified mid-2026 reality (see `../CHARLIENET-CANNON-LINEUP.md` for the research and rationale behind every target).

---

## Trigger tasks (cannons that fire cannons)

OVERMIND introduces two orchestration primitives so cannons can coordinate instead of running as six isolated loops:

- **cross-pool enqueue** — a task whose job is to `INSERT` work into *another* cannon's pool when a condition is met (e.g. FORTRESS finishes `dmarc-stage3-reject` → enqueue "verify mail deliverability" into RELAY).
- **fire-cannon** — a task that calls `create_scheduled_task` to kick another cannon's next fire *immediately*, jumping its interval (used to un-stall a starving cannon).

These are the "tasks that trigger other things" — orchestration, not research. They live in OVERMIND but can be dropped into any pool.

---

## Extending: add a cannon in 3 steps

1. Copy an existing config in `cannons/` to `cannons/<yourname>.json`.
2. Set `instance_target` (unique), `focus`, a `hydrator_prompt`, and your `tasks`.
3. `node forge.mjs cannons/<yourname>.json` → deploy `dist/<yourname>.sql` + ignite the prompt.

The forge validates required fields and rejects duplicate task names before writing.
