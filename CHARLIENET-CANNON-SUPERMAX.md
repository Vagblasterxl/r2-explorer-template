# CharlieNet Task Cannon — Supermax Edition

**Status**: Production-ready
**Purpose**: Self-perpetuating task execution engine that saturates Claude Code + Cowork topics until manually redirected
**Database**: D1 ID `6f02151e-7a24-4cdd-95be-9722faefce77`

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [D1 Schema](#d1-schema)
3. [Initial Task Pool Load](#initial-task-pool-load)
4. [The Task Cannon Prompt](#the-task-cannon-prompt)
5. [Bootstrap Fire](#bootstrap-fire)
6. [Monitoring Queries](#monitoring-queries)
7. [Operational Controls](#operational-controls)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Apply schema (one-time)
npx wrangler d1 execute charlienet --file=./schema.sql

# 2. Load initial task pool
npx wrangler d1 execute charlienet --file=./tasks-supermax-initial.sql

# 3. Verify pool is loaded
npx wrangler d1 execute charlienet --command="SELECT COUNT(*) FROM task_pool WHERE instance_target='supermax' AND status='waiting'"

# 4. Schedule the first cannon fire (kicks off the chain)
# Use create_scheduled_task with the Task Cannon Prompt below
```

---

## D1 Schema

```sql
-- =============================================
-- task_pool: the queue the cannon pulls from
-- =============================================
CREATE TABLE IF NOT EXISTS task_pool (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  category TEXT NOT NULL,
  instance_target TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 50,
  estimated_minutes INTEGER DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'waiting'
    CHECK(status IN ('waiting', 'running', 'completed', 'failed', 'paused')),

  -- Lifecycle timestamps
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  claimed_at DATETIME,
  completed_at DATETIME,
  failed_at DATETIME,
  scheduled_for DATETIME,

  -- Execution metadata
  claimed_by TEXT,
  duration_seconds REAL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  failure_reason TEXT,

  -- Chaining/dependencies (v2 features)
  depends_on INTEGER REFERENCES task_pool(id),
  output TEXT,
  tags TEXT
);

CREATE INDEX IF NOT EXISTS idx_pool_claim ON task_pool(instance_target, status, priority, id);
CREATE INDEX IF NOT EXISTS idx_pool_status ON task_pool(status);
CREATE INDEX IF NOT EXISTS idx_pool_completed ON task_pool(completed_at);

-- =============================================
-- events: telemetry stream from the cannon
-- =============================================
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  task_id INTEGER,
  payload TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source, created_at);
CREATE INDEX IF NOT EXISTS idx_events_task ON events(task_id);

-- =============================================
-- cannon_state: control flags and counters
-- =============================================
CREATE TABLE IF NOT EXISTS cannon_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Initial control flags
INSERT OR IGNORE INTO cannon_state (key, value) VALUES
  ('supermax_paused', 'false'),
  ('supermax_focus', 'claude-code,cowork'),
  ('supermax_max_chain_depth', '1000'),
  ('supermax_chain_depth_today', '0'),
  ('supermax_last_fire', ''),
  ('supermax_salvo_size', '5');
```

---

## Initial Task Pool Load

```sql
-- Clear any old supermax tasks (fresh start)
DELETE FROM task_pool WHERE instance_target = 'supermax';

-- =============================================
-- PRIORITY 1: Pool self-hydration (perpetual)
-- This task generates new tasks every time it runs.
-- It re-queues itself at the end so it never disappears.
-- =============================================
INSERT INTO task_pool (task_name, prompt, category, instance_target, priority, estimated_minutes) VALUES
('pool-hydrator',
'Your job: keep the Supermax task pool hydrated with at least 20 waiting tasks at all times, focused entirely on Claude Code and Cowork.

STEP 1 — Check pool depth:
SELECT
  COUNT(*) FILTER (WHERE status=''waiting'') AS waiting,
  COUNT(*) FILTER (WHERE category=''claude-code'' AND status=''waiting'') AS cc_waiting,
  COUNT(*) FILTER (WHERE category=''cowork'' AND status=''waiting'') AS cw_waiting
FROM task_pool WHERE instance_target=''supermax'';

STEP 2 — If waiting < 20, generate 10 new tasks. Target ratio: 40% claude-code, 40% cowork, 10% skills, 10% integrations.

Task generation rules:
- Prompts must be IMPLEMENTATION tasks ("Build X", "Configure Y", "Create Z"), not research
- Each prompt must be specific enough to execute without clarification
- Vary the angles: setup, optimization, automation, integration, security, UX, debugging, analytics
- Estimated_minutes between 8-30
- Priority: claude-code=10-40, cowork=50-80, skills=85-95, integrations=95-100, meta=100+
- No duplicates (check existing task_name patterns)

Example new tasks to generate (rotate angles):
- "Build a Claude Code skill that [specific function]"
- "Configure Cowork to auto-sync [specific resource]"
- "Create a hook for [specific event] that [specific action]"
- "Audit and harden [specific config] for [specific scenario]"
- "Build an integration between [Claude Code feature] and [Cowork feature]"

STEP 3 — Insert the new tasks:
INSERT INTO task_pool (task_name, prompt, category, instance_target, priority, estimated_minutes)
VALUES (?, ?, ?, ''supermax'', ?, ?);

STEP 4 — Re-queue this hydrator so it runs again:
INSERT INTO task_pool (task_name, prompt, category, instance_target, priority, estimated_minutes)
VALUES (''pool-hydrator'', [this entire prompt verbatim], ''meta'', ''supermax'', 1, 8);

STEP 5 — Log:
INSERT INTO events (event_type, source, payload) VALUES
(''pool.hydrated'', ''supermax'', json_object(''tasks_added'', ?, ''depth_after'', ?, ''cc_share'', ?, ''cw_share'', ?));

The pool never runs dry. This is the heartbeat.',
'meta', 'supermax', 1, 8);

-- =============================================
-- CLAUDE CODE SATURATION (priority 10-45)
-- =============================================
INSERT INTO task_pool (task_name, prompt, category, instance_target, priority, estimated_minutes) VALUES

('cc-permissions-maxflow',
'Audit ~/.claude/settings.json and ~/.claude/settings.local.json. Build a "maximum productivity" permission preset that allows:
- All read operations without prompt (ls, cat, grep, find, git status/log/diff)
- Common safe writes (npm install, git commit/push to claude-* branches)
- Skill invocation without prompt
- Bash for non-destructive commands

Block/prompt for: rm -rf, force-push to main, sudo, system-level changes.

Write the result to ~/.claude/settings.local.json with inline comments. Test that it loads without error.',
'claude-code', 'supermax', 10, 15),

('cc-hooks-full-suite',
'Build a complete hook suite at ~/.claude/hooks/:
1. session-start.sh: validate git branch matches claude/*, run npm install if package.json changed since last session, warn if uncommitted work older than 24h
2. stop-auto-commit.sh: if uncommitted changes exist on a claude/* branch, auto-commit them with message "WIP: session end" + session URL
3. post-tool-bash.sh: log every Bash invocation to ~/.claude/audit/bash.log with timestamp, cwd, command
4. pre-tool-write.sh: block writes to /etc, /usr, /System, ~/.ssh

Wire them all up in ~/.claude/settings.json. Make scripts executable (chmod +x). Test each fires.',
'claude-code', 'supermax', 12, 30),

('cc-keybindings-power',
'Create ~/.claude/keybindings.json with power-user shortcuts:
- Ctrl+K then C: invoke /clear
- Ctrl+K then M: switch to opus-4-7
- Ctrl+K then S: switch to sonnet-4-6
- Ctrl+K then H: switch to haiku-4-5
- Ctrl+K then B: spawn a new claude/* branch from current
- Ctrl+K then T: open task pool dashboard
- Ctrl+Shift+E: export current session
- Ctrl+Shift+R: review pending changes

Document each in a header comment.',
'claude-code', 'supermax', 15, 12),

('cc-mcp-inventory',
'Scan all MCP server configurations available on this system:
- ~/.claude/mcp-servers/ (if exists)
- Anthropic-published MCP servers (filesystem, github, etc.)
- Community MCP servers worth installing

For each, document: what it does, install command, useful for what scenarios, security considerations.

Write to ~/.claude/MCP-INVENTORY.md. Recommend the 3 most valuable to enable now.',
'claude-code', 'supermax', 18, 15),

('cc-skill-factory',
'Build a meta-skill at ~/.claude/skills/forge/ that generates new skills from a prompt.
Usage: /forge "skill that takes X and does Y"

The forge skill should:
1. Parse the user input
2. Determine what tools the new skill needs
3. Generate proper SKILL.md with frontmatter
4. Create the skill directory
5. Test it can be invoked

Include in the skill: example skill definitions, common patterns, and a self-test.',
'claude-code', 'supermax', 22, 25),

('cc-session-pattern-mining',
'Mine ~/.claude/projects/*/*.jsonl for usage patterns:
- Top 10 most-used tools
- Most common error messages
- Average session length by topic
- Which agents get spawned most
- Common workflow chains (tool A → tool B → tool C)

Write findings to ~/.claude/SESSION-PATTERNS.md with 5 specific recommendations to improve workflow based on the data.',
'claude-code', 'supermax', 25, 20),

('cc-fast-mode-tuning',
'Build a fast-mode optimization guide:
1. Document which task types benefit most from fast mode (Opus with fast=true)
2. Identify which tasks degrade in fast mode
3. Create rules for auto-detecting when fast mode helps
4. Write decision tree to ~/.claude/FAST-MODE-GUIDE.md

Test on at least 3 task types: code edit, multi-file refactor, research/exploration.',
'claude-code', 'supermax', 28, 18),

('cc-agent-recipe-book',
'Build an agent recipe book documenting when to use each subagent:
- Explore (when, with what params)
- general-purpose (when not to use)
- Plan (when planning vs. just doing)
- claude-code-guide (when to delegate vs. answer directly)

For each, write: trigger conditions, prompt template, expected output shape, common mistakes.

Save to ~/.claude/AGENT-RECIPES.md.',
'claude-code', 'supermax', 30, 22),

('cc-statusline-custom',
'Build a custom statusline for Claude Code that shows:
- Current git branch (color-coded: red=main, green=claude/*, yellow=other)
- Uncommitted changes count
- Current model (Opus/Sonnet/Haiku)
- Active session duration
- Token usage if available

Configure via ~/.claude/settings.json or appropriate statusline mechanism. Test it renders.',
'claude-code', 'supermax', 33, 15),

('cc-permission-edge-cases',
'Identify and fix permission gotchas:
- Globs that don''t match expected files
- Permissions that should be in user settings vs project settings
- Common false-positive prompts
- Permissions that conflict with each other

Audit current setup, document findings in ~/.claude/PERMISSION-GOTCHAS.md, fix the top 5 issues.',
'claude-code', 'supermax', 36, 18),

('cc-session-export-format',
'Design a session export format that preserves:
- Full conversation
- File changes (diffs)
- Tool calls (sanitized)
- Decisions and rationale
- Replayable command sequence

Write the spec, then build a script that exports a session in this format. Test on the current session.',
'claude-code', 'supermax', 40, 25),

('cc-cli-cheatsheet',
'Build a complete CLI cheatsheet for Claude Code:
- All slash commands (/help, /clear, /model, /fast, /loop, etc.)
- All keyboard shortcuts
- Hidden flags and undocumented options
- Common pipe patterns (claude < file.txt, etc.)
- IDE integration shortcuts

Write to ~/.claude/CHEATSHEET.md. Make it scannable.',
'claude-code', 'supermax', 43, 12),

-- =============================================
-- COWORK SATURATION (priority 50-85)
-- =============================================

('cw-setup-from-zero',
'Document a complete Cowork setup from zero:
1. Account creation steps
2. First workspace
3. Team member invites
4. Folder structure recommendation
5. Permission tiers
6. Sync client setup
7. First document creation
8. Template installation

Write the full guide to ~/.claude/cowork/SETUP-FROM-ZERO.md. Include screenshots descriptions and gotchas.',
'cowork', 'supermax', 50, 30),

('cw-claude-task-bridge',
'Build the bridge between Cowork docs and the Supermax task pool:
1. Create a Cowork document template for "Task Definition" (fields: name, prompt, category, priority, estimated_minutes)
2. Build a sync script that reads task docs from a designated Cowork folder
3. Insert parsed tasks into task_pool via D1
4. Tag inserted tasks with source=cowork and link back to the doc

Implement the sync script. Test it converts at least 1 doc into a pool task.',
'cowork', 'supermax', 52, 30),

('cw-templates-essential',
'Create 10 essential Cowork document templates:
1. Async standup
2. Decision log (ADR-style)
3. RFC / proposal
4. Sprint planning board
5. Onboarding checklist
6. Knowledge base article
7. Meeting notes with action items
8. Project kickoff
9. Postmortem
10. Weekly review

For each: write the template content, document who uses it and when, save to ~/.claude/cowork/templates/.',
'cowork', 'supermax', 55, 25),

('cw-sync-stress-test',
'Stress-test Cowork sync:
1. Offline editing + reconnect (does the diff resolve cleanly?)
2. Concurrent edits to same paragraph (conflict resolution UX)
3. Large file sync (1MB, 10MB, 100MB if possible)
4. Folder restructure mid-sync
5. Network flap during upload

Document each scenario''s behavior in ~/.claude/cowork/SYNC-BEHAVIOR.md with concrete recommendations.',
'cowork', 'supermax', 58, 25),

('cw-automation-trifecta',
'Build three Cowork automation hooks:
1. On git commit → append changelog entry to a designated Cowork doc
2. On PR merged → update a "Shipped This Week" Cowork doc
3. On task completed in pool → log to a "Cannon Activity" Cowork doc

Implement at least 2. Document the third. Save scripts to ~/.claude/cowork/hooks/.',
'cowork', 'supermax', 60, 30),

('cw-mobile-capture',
'Design and implement a mobile-first capture workflow:
1. Quick text note → Cowork inbox (via shortcut/widget if iOS/Android)
2. Voice memo → transcribed Cowork doc
3. Photo → Cowork attachment with OCR text extraction
4. Email → Cowork doc (via designated forward address)

Implement at least the text and email paths. Document the rest.',
'cowork', 'supermax', 63, 25),

('cw-security-hardening',
'Cowork security hardening pass:
1. Audit current sharing/permissions on existing docs
2. Identify over-shared documents
3. Document encryption at rest/transit
4. Build a "security review" checklist for new workspaces
5. Set up 2FA if not already on

Write findings + checklist to ~/.claude/cowork/SECURITY-HARDENING.md.',
'cowork', 'supermax', 66, 20),

('cw-knowledge-graph',
'Build a knowledge graph view of Cowork content:
1. Crawl docs and extract: titles, links between docs, mentions, tags
2. Build a graph (nodes=docs, edges=links/mentions)
3. Identify orphan docs (no inbound links)
4. Identify hub docs (many inbound links)
5. Output as Mermaid diagram in ~/.claude/cowork/KNOWLEDGE-GRAPH.md

Implement the crawler and diagram generator.',
'cowork', 'supermax', 70, 30),

('cw-search-supercharge',
'Improve Cowork search:
1. Document current search limitations
2. Build a local index of doc titles, headers, and key content
3. Create a fast CLI search tool: cowork-search "query"
4. Add full-text search with ranking
5. Add semantic search if embeddings available

Implement at least the local index + CLI tool.',
'cowork', 'supermax', 73, 28),

('cw-meeting-flow',
'Build a meeting-to-Cowork workflow:
1. Pre-meeting: agenda template auto-generated
2. During: shared note-taking template
3. Post: action items auto-extracted and assigned
4. Follow-up: scheduled review

Implement the templates and a script to scaffold a meeting doc package. Save to ~/.claude/cowork/meetings/.',
'cowork', 'supermax', 76, 20),

('cw-version-history-analytics',
'Build Cowork version-history analytics:
1. For each doc, count edit frequency
2. Identify "hot" docs (high edit rate)
3. Identify "stale" docs (no edits in 90+ days)
4. Surface "in-flight" docs (edited in last 24h by multiple people)
5. Output a weekly health report

Write the analytics script. Output to ~/.claude/cowork/DOC-HEALTH.md.',
'cowork', 'supermax', 79, 22),

('cw-export-everything',
'Build a complete Cowork backup/export tool:
1. Export all docs to markdown
2. Preserve folder structure
3. Include attachments
4. Include version history if accessible
5. Include sharing/permissions metadata

Test on a small workspace. Document the export at ~/.claude/cowork/EXPORT-GUIDE.md.',
'cowork', 'supermax', 82, 30),

-- =============================================
-- SKILLS & INTEGRATIONS (priority 85-100)
-- =============================================

('skill-capture',
'Build a Claude Code skill at ~/.claude/skills/capture/ that:
1. Takes any text as input
2. Appends to a Cowork "Inbox" doc (or creates if missing)
3. Timestamps and tags it
4. Returns confirmation with link
Target: <2s execution. Test it works end-to-end.',
'skills', 'supermax', 85, 15),

('skill-loadtasks',
'Build a skill at ~/.claude/skills/loadtasks/ that:
1. Accepts a markdown file path
2. Parses task definitions (format: ## Task Name + description + metadata block)
3. Inserts all tasks into the Supermax pool via D1
4. Returns count + IDs of loaded tasks
Test on a sample markdown file with 5 tasks.',
'skills', 'supermax', 87, 12),

('skill-poolstatus',
'Build a skill at ~/.claude/skills/poolstatus/ that:
1. Queries the task_pool table
2. Returns: waiting/running/completed/failed counts
3. Shows last 5 completed tasks
4. Shows pool depth trend (last hour)
5. Shows next 5 tasks queued
Render output as formatted text.',
'skills', 'supermax', 89, 12),

('skill-burnreport',
'Build a skill at ~/.claude/skills/burnreport/ that:
1. Queries events table
2. Reports last hour of cannon activity
3. Shows tasks completed, failed, salvo sizes, durations
4. Identifies hot streaks and stalls
5. Outputs as markdown table
Test it renders correctly.',
'skills', 'supermax', 91, 15),

('integration-unified-dashboard',
'Build a unified dashboard HTML page that shows:
1. Current task pool status (waiting/running/completed)
2. Last 10 events from the cannon
3. Recent Cowork doc updates (if API available)
4. Active Claude Code sessions count
5. Hourly throughput chart (ASCII or canvas)

Save as ~/.claude/dashboard/index.html with auto-refresh every 30s. Open in browser to verify.',
'integrations', 'supermax', 95, 25),

('integration-cowork-claude-loop',
'Close the Cowork ↔ Claude Code loop:
1. Cowork doc updates → trigger Claude Code task
2. Claude Code task completion → update Cowork doc
3. Both events logged to a shared "activity stream" doc
4. Daily summary auto-generated

Implement the bidirectional flow. Document at ~/.claude/integrations/COWORK-CLAUDE-LOOP.md.',
'integrations', 'supermax', 97, 30),

-- =============================================
-- META (priority 100+)
-- =============================================

('meta-task-format-v2',
'Design Task Format v2:
- Dependencies (task B waits for task A completion)
- Output capture (task A''s result accessible to task B)
- Conditional execution (only run if {condition})
- Scheduled tasks (run after timestamp X)
- Recurring tasks (cron-style)

Write spec to ~/.claude/cannon/TASK-FORMAT-V2.md. Propose schema migration. Include backward compatibility plan.',
'meta', 'supermax', 100, 25),

('meta-cannon-analytics',
'Build cannon analytics page:
- Salvo size distribution (histogram)
- Completion rate by category
- Average task duration by category
- Hourly throughput (last 24h)
- Failure clustering (which task types fail most)
- Hot streak / cold streak detection

Query events table, render as HTML at ~/.claude/dashboard/analytics.html.',
'meta', 'supermax', 102, 20),

('meta-circuit-breaker',
'Implement a real circuit breaker in cannon_state table:
- Track failure rate (failures per hour)
- When threshold exceeded, set supermax_paused=true
- Auto-reset after cooldown period
- Log circuit_open and circuit_closed events
Write the queries the cannon uses. Document at ~/.claude/cannon/CIRCUIT-BREAKER.md.',
'meta', 'supermax', 105, 18),

('meta-task-quality-scorer',
'Build a quality scorer for completed tasks:
- Pull last 50 completed tasks from pool
- Score each on: completeness, output quality, time-vs-estimate
- Identify systemic issues (estimates too low, certain categories always rushed)
- Recommend prompt improvements
Save to ~/.claude/cannon/QUALITY-REPORT.md.',
'meta', 'supermax', 108, 25),

('meta-task-deduplication',
'Build a dedup scanner for the pool:
- Find tasks with similar names or prompts
- Identify duplicate-effort risk
- Either merge them or kill the redundant ones
- Report what was found
Run it, take action, log results.',
'meta', 'supermax', 110, 15);

-- Verify load
SELECT
  COUNT(*) AS total_loaded,
  COUNT(*) FILTER (WHERE category='claude-code') AS claude_code,
  COUNT(*) FILTER (WHERE category='cowork') AS cowork,
  COUNT(*) FILTER (WHERE category='skills') AS skills,
  COUNT(*) FILTER (WHERE category='integrations') AS integrations,
  COUNT(*) FILTER (WHERE category='meta') AS meta
FROM task_pool
WHERE instance_target = 'supermax' AND status = 'waiting';
```

---

## The Task Cannon Prompt

**This is what you load into `create_scheduled_task` as the `prompt` field. It self-perpetuates.**

```
You are the CharlieNet Task Cannon for the Supermax instance. You are not a queue worker — you are a burn engine. Each fire is a salvo, not a single shot. You execute multiple tasks per fire, parallelize where you can, hand outputs forward, and never let the chain die.

DATABASE: D1 ID 6f02151e-7a24-4cdd-95be-9722faefce77
TABLES: task_pool, events, cannon_state

=============================================
PHASE 1: PRE-FLIGHT (always, in this order)
=============================================

1a. Log the fire:
INSERT INTO events (event_type, source, payload) VALUES
('cannon.fired', 'supermax', json_object('timestamp', datetime('now')));

1b. Check pause flag:
SELECT value FROM cannon_state WHERE key='supermax_paused';
If 'true' → log 'cannon.paused' event, schedule next fire at +30min, exit. Do NOT execute tasks.

1c. Reap zombies (stuck >15min):
UPDATE task_pool SET status='waiting', claimed_at=NULL, retry_count=COALESCE(retry_count,0)+1
WHERE instance_target='supermax' AND status='running'
  AND claimed_at < datetime('now','-15 minutes') AND COALESCE(retry_count,0) < 3;

UPDATE task_pool SET status='failed', failed_at=datetime('now'), failure_reason='zombie_max_retries'
WHERE instance_target='supermax' AND status='running'
  AND claimed_at < datetime('now','-15 minutes') AND COALESCE(retry_count,0) >= 3;

=============================================
PHASE 2: SALVO CLAIM (atomic, up to 5 tasks)
=============================================

Use this CAS pattern (or whatever the D1 binding's equivalent is):

WITH selected AS (
  SELECT id FROM task_pool
  WHERE instance_target='supermax' AND status='waiting'
    AND (scheduled_for IS NULL OR scheduled_for <= datetime('now'))
  ORDER BY priority ASC, id ASC
  LIMIT 5
)
UPDATE task_pool
SET status='running', claimed_at=datetime('now'), claimed_by='supermax-cannon'
WHERE id IN (SELECT id FROM selected) AND status='waiting'
RETURNING id, task_name, prompt, category, estimated_minutes;

If 0 rows returned → jump to PHASE 5.

=============================================
PHASE 3: EXECUTE THE SALVO
=============================================

For each task in the salvo:

- Read the prompt VERBATIM. Do exactly what it says.
- Be thorough: read files, run commands, write artifacts, commit/push code if relevant.
- If the task touches code in a repo, commit and push to the appropriate claude/* branch.
- Spawn sub-agents (Explore, general-purpose, Plan) for any task that would eat >30k tokens of context.
- Parallelize: if two tasks in the salvo are independent (different files/topics), launch them as parallel sub-agents in ONE message.
- Hand outputs forward: if task N produces a file/finding task N+1 can use, pass it in.
- Quality over speed PER TASK. But never idle between tasks.

ON SUCCESS:
UPDATE task_pool SET status='completed', completed_at=datetime('now'),
  duration_seconds=(julianday('now')-julianday(claimed_at))*86400,
  output=?  -- optional: capture brief result for later tasks
WHERE id=?;

INSERT INTO events (event_type, source, task_id, payload) VALUES
('cannon.completed', 'supermax', ?, json_object('task_name', ?, 'category', ?, 'duration_seconds', ?));

ON FAILURE (genuinely impossible, not just hard):
UPDATE task_pool SET
  status=CASE WHEN COALESCE(retry_count,0) < 2 THEN 'waiting' ELSE 'failed' END,
  claimed_at=NULL,
  retry_count=COALESCE(retry_count,0)+1,
  failure_reason=?,
  failed_at=CASE WHEN COALESCE(retry_count,0) >= 2 THEN datetime('now') ELSE NULL END
WHERE id=?;

INSERT INTO events (event_type, source, task_id, payload) VALUES
('cannon.task_failed', 'supermax', ?, json_object('error', ?, 'will_retry', ?));

Then KEEP GOING. One failure doesn't kill the salvo.

=============================================
PHASE 4: SALVO SUMMARY
=============================================

INSERT INTO events (event_type, source, payload) VALUES
('cannon.salvo_complete', 'supermax', json_object(
  'tasks_completed', ?, 'tasks_failed', ?, 'salvo_duration_seconds', ?, 'next_interval_seconds', ?
));

=============================================
PHASE 5: EMPTY POOL HANDLING
=============================================

If PHASE 2 returned nothing:

INSERT INTO events (event_type, source, payload) VALUES
('cannon.pool_empty', 'supermax', json_object('message', 'Supermax pool drained'));

Suggest to operator: load more tasks. Pool hydrator should have prevented this — investigate why it didn't run.

Set next fire interval to +10 minutes (idle backoff).

=============================================
PHASE 6: CHAIN THE NEXT FIRE (ALWAYS, NEVER SKIP)
=============================================

Interval based on state:
- Salvo of 5 completed cleanly → +90 seconds (hot streak)
- Salvo of 1-4 completed → +3 minutes (default)
- Pool empty → +10 minutes (idle)
- All in salvo failed → +5 minutes (cooldown)
- Paused → +30 minutes

Call create_scheduled_task with:
- taskId: 'task-cannon-supermax-' + Date.now()  (UNIQUE, never collides)
- fireAt: ISO 8601 with Pacific offset, now + interval
- prompt: THIS ENTIRE PROMPT, verbatim

CHAIN SAFETY: query cannon_state for supermax_chain_depth_today. If >= 1000, do NOT schedule next fire. Log 'cannon.runaway_detected' and stop. Require manual reset.

Otherwise: increment chain depth:
UPDATE cannon_state SET value=CAST(value AS INTEGER)+1, updated_at=datetime('now') WHERE key='supermax_chain_depth_today';

SCHEDULE THE NEXT FIRE BEFORE WRITING YOUR FINAL RESPONSE. The chain must survive even if your final message fails.

=============================================
OPERATING MINDSET
=============================================

- You are not careful. You are precise.
- Idle time is wasted. Hot streak interval (90s) is achievable — push for it.
- Sub-agents are your force multiplier. Use them.
- Every salvo logs events. The operator watches via dashboard.
- The chain is sacred. Schedule next fire FIRST.
- Focus is Claude Code and Cowork until the pool says otherwise. No drift.
```

---

## Bootstrap Fire

```javascript
// Run this ONCE to start the chain. After that, the cannon self-perpetuates.

create_scheduled_task({
  taskId: `task-cannon-supermax-bootstrap-${Date.now()}`,
  fireAt: new Date(Date.now() + 60000).toISOString(),  // +1 minute
  prompt: /* The Task Cannon Prompt from the section above, verbatim */
});
```

---

## Monitoring Queries

```sql
-- Current pool depth + category breakdown
SELECT
  status,
  category,
  COUNT(*) AS count,
  AVG(estimated_minutes) AS avg_est_min
FROM task_pool
WHERE instance_target='supermax'
GROUP BY status, category
ORDER BY status, category;

-- Last 20 events
SELECT created_at, event_type, source, task_id, payload
FROM events
WHERE source='supermax'
ORDER BY id DESC
LIMIT 20;

-- Hourly throughput (last 24h)
SELECT
  strftime('%Y-%m-%d %H:00', completed_at) AS hour,
  COUNT(*) AS completed,
  AVG(duration_seconds) AS avg_duration
FROM task_pool
WHERE instance_target='supermax'
  AND status='completed'
  AND completed_at > datetime('now', '-24 hours')
GROUP BY hour
ORDER BY hour DESC;

-- Salvo size distribution (last 100 salvos)
SELECT
  json_extract(payload, '$.tasks_completed') AS salvo_size,
  COUNT(*) AS occurrences
FROM events
WHERE event_type='cannon.salvo_complete'
  AND source='supermax'
ORDER BY id DESC
LIMIT 100;

-- Failed tasks needing attention
SELECT id, task_name, category, failure_reason, retry_count, failed_at
FROM task_pool
WHERE instance_target='supermax' AND status='failed'
ORDER BY failed_at DESC;

-- Chain depth today
SELECT value FROM cannon_state WHERE key='supermax_chain_depth_today';

-- Recent fires (heartbeat check — should be every few minutes)
SELECT created_at, payload
FROM events
WHERE event_type='cannon.fired' AND source='supermax'
ORDER BY id DESC LIMIT 10;
```

---

## Operational Controls

### Pause the cannon
```sql
UPDATE cannon_state SET value='true', updated_at=datetime('now') WHERE key='supermax_paused';
```
The cannon will still fire (to maintain the chain) but skip task execution until unpaused.

### Resume
```sql
UPDATE cannon_state SET value='false', updated_at=datetime('now') WHERE key='supermax_paused';
```

### Stop the chain entirely
```sql
UPDATE cannon_state SET value='1000', updated_at=datetime('now') WHERE key='supermax_chain_depth_today';
```
This trips the runaway detector. No new fires will be scheduled.

### Reset chain depth (daily, or manually)
```sql
UPDATE cannon_state SET value='0', updated_at=datetime('now') WHERE key='supermax_chain_depth_today';
```

### Reset failed tasks to retry
```sql
UPDATE task_pool SET status='waiting', retry_count=0, failure_reason=NULL, failed_at=NULL
WHERE instance_target='supermax' AND status='failed';
```

### Drain mode (let current work finish, then stop)
```sql
-- Mark all waiting tasks as paused
UPDATE task_pool SET status='paused' WHERE instance_target='supermax' AND status='waiting';
-- Cannon will still fire but find nothing to claim
```

### Restore from drain
```sql
UPDATE task_pool SET status='waiting' WHERE instance_target='supermax' AND status='paused';
```

### Redirect focus (when Claude Code + Cowork saturation is done)
```sql
UPDATE cannon_state SET value='new-topic,another-topic' WHERE key='supermax_focus';
-- Then update the pool-hydrator prompt to use the new focus
```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Cannon stopped firing | Chain depth hit 1000 | Reset `supermax_chain_depth_today` to 0 |
| Pool keeps emptying | Hydrator failed or got removed | Re-insert the pool-hydrator task manually |
| Same task keeps failing | Bad prompt or genuine impossibility | Mark `status='failed'`, fix prompt, re-insert |
| Many zombies | Tasks too long for 15min timeout | Increase timeout in PHASE 1c |
| Duplicate work | Multiple cannon instances racing | Check `claimed_by` — only one source should claim |
| Hot streak never achieved | Salvo size too small | Increase `supermax_salvo_size` in cannon_state |
| Schedule task collision | Same taskId reused | Confirm unique timestamp suffix in PHASE 6 |

---

## What This Is Pointed At

**Right now**: Claude Code and Cowork saturation. The pool is loaded with 30+ implementation tasks across:
- Claude Code config, hooks, keybindings, MCP, skills, agents, sessions, statusline, permissions, exports, CLI
- Cowork setup, templates, sync, automation, mobile, security, knowledge graph, search, meetings, analytics, exports
- Cross-tool skills (capture, loadtasks, poolstatus, burnreport)
- Integrations (unified dashboard, Cowork↔Claude loop)
- Meta (task format v2, analytics, circuit breaker, quality scoring, dedup)

**The pool-hydrator (priority 1) keeps generating more of these forever** until you:
1. Update `supermax_focus` to a new topic
2. Update the hydrator prompt to match
3. Or pause the cannon

**Nothing else gets touched until you say so.**
