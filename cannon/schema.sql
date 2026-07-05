-- =====================================================================
-- CharlieNet Cannon — Shared Schema
-- Apply once per D1 database. All cannons share these three tables.
-- =====================================================================

-- ---------------------------------------------------------------------
-- task_pool: the queue every cannon pulls from (filtered by instance_target)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_pool (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  category TEXT NOT NULL,
  instance_target TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 50,
  estimated_minutes INTEGER DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'waiting'
    CHECK(status IN ('waiting','running','completed','failed','paused')),

  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  claimed_at   DATETIME,
  completed_at DATETIME,
  failed_at    DATETIME,
  scheduled_for DATETIME,

  claimed_by   TEXT,
  duration_seconds REAL,
  retry_count  INTEGER NOT NULL DEFAULT 0,
  failure_reason TEXT,

  depends_on   INTEGER REFERENCES task_pool(id),
  output       TEXT,
  tags         TEXT
);

CREATE INDEX IF NOT EXISTS idx_pool_claim     ON task_pool(instance_target, status, priority, id);
CREATE INDEX IF NOT EXISTS idx_pool_status    ON task_pool(status);
CREATE INDEX IF NOT EXISTS idx_pool_completed ON task_pool(completed_at);

-- ---------------------------------------------------------------------
-- events: telemetry stream shared by all cannons (filter by source)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  source     TEXT NOT NULL,
  task_id    INTEGER,
  payload    TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_type   ON events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source, created_at);
CREATE INDEX IF NOT EXISTS idx_events_task   ON events(task_id);

-- ---------------------------------------------------------------------
-- cannon_state: per-cannon control flags & counters (key is namespaced)
--   e.g. 'fortress_paused', 'conduit_chain_depth_today'
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cannon_state (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
