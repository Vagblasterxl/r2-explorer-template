#!/usr/bin/env node
// =====================================================================
// CharlieNet Cannon Forge  —  standalone, zero-dependency generator
//
// Turns a cannon config (JSON) into a deployable cannon:
//   • <name>.sql        — control flags + pool load (INSERT statements)
//   • <name>-PROMPT.md  — the self-perpetuating cannon prompt
//
// Usage:
//   node forge.mjs cannons/fortress.json     # forge one
//   node forge.mjs --all                     # forge every config in cannons/
//   node forge.mjs --help
//
// No npm install. No network. Reads JSON, writes files to dist/.
// =====================================================================

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CANNONS_DIR = join(__dirname, 'cannons');
const DIST_DIR = join(__dirname, 'dist');

// ---- SQL escaping: double single-quotes, that's it (D1 is SQLite) ----
const q = (s) => String(s).replace(/'/g, "''");

// ---- The generic cannon prompt. {{TOKENS}} get replaced per config. ----
const PROMPT_TEMPLATE = `You are the CharlieNet Task Cannon for the {{DISPLAY_NAME}} instance ({{INSTANCE_TARGET}}). You are not a queue worker — you are a burn engine. Each fire is a salvo, not a single shot. You execute multiple tasks per fire, parallelize where independent, hand outputs forward, and never let the chain die.

FOCUS: {{FOCUS}}
DATABASE: D1 ID {{D1_ID}}
TABLES: task_pool, events, cannon_state
THIS INSTANCE: instance_target = '{{INSTANCE_TARGET}}', event source = '{{INSTANCE_TARGET}}'
STATE KEYS (namespaced): {{INSTANCE_TARGET}}_paused, {{INSTANCE_TARGET}}_chain_depth_today, {{INSTANCE_TARGET}}_max_chain_depth, {{INSTANCE_TARGET}}_salvo_size

=====================================================================
PHASE 1 — PRE-FLIGHT (always, in this order)
=====================================================================
1a. Log the fire:
    INSERT INTO events (event_type, source, payload) VALUES
    ('cannon.fired', '{{INSTANCE_TARGET}}', json_object('timestamp', datetime('now')));

1b. Pause check:
    SELECT value FROM cannon_state WHERE key='{{INSTANCE_TARGET}}_paused';
    If 'true' -> log 'cannon.paused', schedule next fire at +30min, EXIT (do not execute tasks).

1c. Zombie reaper (stuck >15min):
    UPDATE task_pool SET status='waiting', claimed_at=NULL, retry_count=COALESCE(retry_count,0)+1
    WHERE instance_target='{{INSTANCE_TARGET}}' AND status='running'
      AND claimed_at < datetime('now','-15 minutes') AND COALESCE(retry_count,0) < 3;
    UPDATE task_pool SET status='failed', failed_at=datetime('now'), failure_reason='zombie_max_retries'
    WHERE instance_target='{{INSTANCE_TARGET}}' AND status='running'
      AND claimed_at < datetime('now','-15 minutes') AND COALESCE(retry_count,0) >= 3;

=====================================================================
PHASE 2 — SALVO CLAIM (atomic, up to {{SALVO_SIZE}} tasks)
=====================================================================
    WITH selected AS (
      SELECT id FROM task_pool
      WHERE instance_target='{{INSTANCE_TARGET}}' AND status='waiting'
        AND (scheduled_for IS NULL OR scheduled_for <= datetime('now'))
      ORDER BY priority ASC, id ASC
      LIMIT {{SALVO_SIZE}}
    )
    UPDATE task_pool
    SET status='running', claimed_at=datetime('now'), claimed_by='{{INSTANCE_TARGET}}-cannon'
    WHERE id IN (SELECT id FROM selected) AND status='waiting'
    RETURNING id, task_name, prompt, category, estimated_minutes;

    If 0 rows -> jump to PHASE 5.

=====================================================================
PHASE 3 — EXECUTE THE SALVO
=====================================================================
For each task in the salvo:
  - Read the prompt VERBATIM. Do exactly what it says. No summarizing, no deferring.
  - Be thorough: read files, run commands, write artifacts, commit/push code to the appropriate claude/* branch when a task touches a repo.
  - Spawn sub-agents for any task that would eat >30k tokens of context. You are an orchestrator.
  - Parallelize: independent tasks (different files/topics) launch as parallel sub-agents in ONE message.
  - Hand outputs forward: if task N produces something task N+1 needs, pass it in (use the output column).
  - Quality over speed PER TASK. Never idle between tasks.

  SECURITY TASKS (this cannon may include them): never weaken a control to "make a task pass". If a task would require disabling MFA, exposing a secret, opening a firewall, or lowering an auth bar, STOP that task, mark it failed with reason 'refused_unsafe', and log it. Hardening only moves one direction.

  ON SUCCESS:
    UPDATE task_pool SET status='completed', completed_at=datetime('now'),
      duration_seconds=(julianday('now')-julianday(claimed_at))*86400, output=?
    WHERE id=?;
    INSERT INTO events (event_type, source, task_id, payload) VALUES
    ('cannon.completed', '{{INSTANCE_TARGET}}', ?, json_object('task_name', ?, 'category', ?, 'duration_seconds', ?));

  ON FAILURE (genuinely blocked, not just hard):
    UPDATE task_pool SET
      status=CASE WHEN COALESCE(retry_count,0) < 2 THEN 'waiting' ELSE 'failed' END,
      claimed_at=NULL, retry_count=COALESCE(retry_count,0)+1, failure_reason=?,
      failed_at=CASE WHEN COALESCE(retry_count,0) >= 2 THEN datetime('now') ELSE NULL END
    WHERE id=?;
    INSERT INTO events (event_type, source, task_id, payload) VALUES
    ('cannon.task_failed', '{{INSTANCE_TARGET}}', ?, json_object('error', ?, 'will_retry', ?));
  Then KEEP GOING. One failure doesn't kill the salvo.

=====================================================================
PHASE 4 — SALVO SUMMARY
=====================================================================
    INSERT INTO events (event_type, source, payload) VALUES
    ('cannon.salvo_complete', '{{INSTANCE_TARGET}}', json_object(
      'tasks_completed', ?, 'tasks_failed', ?, 'salvo_duration_seconds', ?, 'next_interval_seconds', ?));

=====================================================================
PHASE 5 — EMPTY POOL
=====================================================================
If PHASE 2 returned nothing:
    INSERT INTO events (event_type, source, payload) VALUES
    ('cannon.pool_empty', '{{INSTANCE_TARGET}}', json_object('message', '{{DISPLAY_NAME}} pool drained'));
The pool hydrator (priority 1) should have prevented this — investigate why it didn't run. Set next interval to +10min.

=====================================================================
PHASE 6 — CHAIN THE NEXT FIRE (ALWAYS, NEVER SKIP)
=====================================================================
Interval by state:
  - Salvo of {{SALVO_SIZE}} completed cleanly -> +90 seconds (hot streak)
  - Salvo of 1..{{SALVO_SIZE_MINUS_1}} completed -> +3 minutes (default)
  - Pool empty -> +10 minutes (idle)
  - All in salvo failed -> +5 minutes (cooldown)
  - Paused -> +30 minutes

Runaway guard:
    SELECT value FROM cannon_state WHERE key='{{INSTANCE_TARGET}}_chain_depth_today';
    If >= {{MAX_CHAIN_DEPTH}}: do NOT schedule. Log 'cannon.runaway_detected'. Stop. Manual reset required.
    Else: UPDATE cannon_state SET value=CAST(value AS INTEGER)+1, updated_at=datetime('now')
          WHERE key='{{INSTANCE_TARGET}}_chain_depth_today';

Then call create_scheduled_task with:
  - taskId: 'task-cannon-{{INSTANCE_TARGET}}-' + Date.now()   (UNIQUE — never collides)
  - fireAt: ISO 8601 with Pacific offset, now + interval
  - prompt: THIS ENTIRE PROMPT, verbatim

SCHEDULE THE NEXT FIRE BEFORE WRITING YOUR FINAL RESPONSE. The chain must survive even if the final message fails.

=====================================================================
MINDSET
=====================================================================
- Not careful — precise. Idle time is wasted. Push for the 90s hot streak.
- Sub-agents are the force multiplier. Use them.
- Every salvo logs events; the operator watches via dashboard.
- The chain is sacred. Schedule next fire FIRST.
- Focus is {{FOCUS}} until cannon_state says otherwise. No drift.`;

function forgeSQL(cfg) {
  const it = cfg.instance_target;
  const salvo = cfg.salvo_size ?? 5;
  const maxDepth = cfg.max_chain_depth ?? 1000;
  const lines = [];

  lines.push(`-- =====================================================================`);
  lines.push(`-- CANNON: ${cfg.display_name} (${it})`);
  lines.push(`-- FOCUS:  ${cfg.focus}`);
  lines.push(`-- Generated by forge.mjs — do not hand-edit; edit the config instead.`);
  lines.push(`-- =====================================================================`);
  lines.push('');
  lines.push(`-- Control flags (namespaced by instance_target)`);
  lines.push(`INSERT OR REPLACE INTO cannon_state (key, value) VALUES`);
  lines.push(`  ('${it}_paused', 'false'),`);
  lines.push(`  ('${it}_focus', '${q(cfg.focus)}'),`);
  lines.push(`  ('${it}_max_chain_depth', '${maxDepth}'),`);
  lines.push(`  ('${it}_chain_depth_today', '0'),`);
  lines.push(`  ('${it}_salvo_size', '${salvo}'),`);
  lines.push(`  ('${it}_last_fire', '');`);
  lines.push('');
  lines.push(`-- Fresh load: clear prior tasks for this instance`);
  lines.push(`DELETE FROM task_pool WHERE instance_target='${it}';`);
  lines.push('');

  // Priority 1: the hydrator, always first
  lines.push(`-- PRIORITY 1 — pool hydrator (perpetual; re-queues itself)`);
  lines.push(`INSERT INTO task_pool (task_name, prompt, category, instance_target, priority, estimated_minutes) VALUES`);
  lines.push(`('pool-hydrator', '${q(cfg.hydrator_prompt)}', 'meta', '${it}', 1, 8);`);
  lines.push('');

  // The task pool
  lines.push(`-- TASK POOL (${cfg.tasks.length} tasks)`);
  lines.push(`INSERT INTO task_pool (task_name, prompt, category, instance_target, priority, estimated_minutes) VALUES`);
  const rows = cfg.tasks.map((t) =>
    `('${q(t.name)}', '${q(t.prompt)}', '${q(t.category)}', '${it}', ${t.priority}, ${t.estimated_minutes})`
  );
  lines.push(rows.join(',\n') + ';');
  lines.push('');

  // Verify
  lines.push(`-- Verify`);
  lines.push(`SELECT '${cfg.display_name}: ' || COUNT(*) || ' tasks loaded' AS status`);
  lines.push(`FROM task_pool WHERE instance_target='${it}' AND status='waiting';`);
  lines.push('');
  return lines.join('\n');
}

function forgePrompt(cfg) {
  const salvo = cfg.salvo_size ?? 5;
  return PROMPT_TEMPLATE
    .replaceAll('{{DISPLAY_NAME}}', cfg.display_name)
    .replaceAll('{{INSTANCE_TARGET}}', cfg.instance_target)
    .replaceAll('{{FOCUS}}', cfg.focus)
    .replaceAll('{{D1_ID}}', cfg.d1_id ?? '<SET_D1_ID>')
    .replaceAll('{{SALVO_SIZE_MINUS_1}}', String(salvo - 1))
    .replaceAll('{{SALVO_SIZE}}', String(salvo))
    .replaceAll('{{MAX_CHAIN_DEPTH}}', String(cfg.max_chain_depth ?? 1000));
}

function validate(cfg, file) {
  const need = ['instance_target', 'display_name', 'focus', 'hydrator_prompt', 'tasks'];
  for (const k of need) if (!cfg[k]) throw new Error(`${file}: missing required field '${k}'`);
  if (!Array.isArray(cfg.tasks) || cfg.tasks.length === 0) throw new Error(`${file}: 'tasks' must be a non-empty array`);
  cfg.tasks.forEach((t, i) => {
    for (const k of ['name', 'prompt', 'category', 'priority', 'estimated_minutes'])
      if (t[k] === undefined) throw new Error(`${file}: task[${i}] missing '${k}'`);
  });
  const names = cfg.tasks.map((t) => t.name);
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  if (dupes.length) throw new Error(`${file}: duplicate task names: ${[...new Set(dupes)].join(', ')}`);
}

function forgeOne(file) {
  const cfg = JSON.parse(readFileSync(file, 'utf8'));
  validate(cfg, basename(file));
  if (!existsSync(DIST_DIR)) mkdirSync(DIST_DIR, { recursive: true });
  const it = cfg.instance_target;
  const sqlPath = join(DIST_DIR, `${it}.sql`);
  const promptPath = join(DIST_DIR, `${it}-PROMPT.md`);
  writeFileSync(sqlPath, forgeSQL(cfg));
  writeFileSync(promptPath, `# ${cfg.display_name} Cannon — Fire Prompt\n\nLoad this as the \`prompt\` field of \`create_scheduled_task\` to start the chain.\n\n\`\`\`\n${forgePrompt(cfg)}\n\`\`\`\n`);
  const est = cfg.tasks.reduce((a, t) => a + t.estimated_minutes, 0);
  console.log(`  ✔ ${cfg.display_name.padEnd(10)} ${String(cfg.tasks.length).padStart(2)} tasks  ~${est}min  -> dist/${it}.sql, dist/${it}-PROMPT.md`);
  return cfg;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.length === 0) {
    console.log(`CharlieNet Cannon Forge
  node forge.mjs cannons/<name>.json   forge one cannon
  node forge.mjs --all                 forge every cannon in cannons/
Outputs land in dist/ : <name>.sql (pool load) and <name>-PROMPT.md (fire prompt).`);
    process.exit(args.length === 0 ? 1 : 0);
  }

  console.log('CharlieNet Cannon Forge\n');
  let configs = [];
  if (args.includes('--all')) {
    configs = readdirSync(CANNONS_DIR).filter((f) => f.endsWith('.json')).map((f) => join(CANNONS_DIR, f)).sort();
  } else {
    configs = args.filter((a) => !a.startsWith('--'));
  }

  const forged = [];
  for (const f of configs) {
    try { forged.push(forgeOne(f)); }
    catch (e) { console.error(`  x ${basename(f)}: ${e.message}`); process.exitCode = 1; }
  }
  console.log(`\nForged ${forged.length} cannon(s). Deploy:`);
  console.log(`  npx wrangler d1 execute <DB> --file=schema.sql        # once`);
  console.log(`  npx wrangler d1 execute <DB> --file=dist/<name>.sql   # per cannon`);
  console.log(`  then load dist/<name>-PROMPT.md into create_scheduled_task to ignite.`);
}

main();
