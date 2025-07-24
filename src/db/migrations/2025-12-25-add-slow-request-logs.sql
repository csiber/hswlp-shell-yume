CREATE TABLE IF NOT EXISTS slow_request_logs (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  user_id TEXT,
  session_hash TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS slow_request_logs_user_id_idx ON slow_request_logs (user_id);
CREATE INDEX IF NOT EXISTS slow_request_logs_created_at_idx ON slow_request_logs (created_at);
