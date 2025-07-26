CREATE TABLE IF NOT EXISTS uploads_viewed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  upload_id TEXT NOT NULL,
  viewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, upload_id)
);
CREATE INDEX IF NOT EXISTS uploads_viewed_user_idx ON uploads_viewed (user_id);
CREATE INDEX IF NOT EXISTS uploads_viewed_upload_idx ON uploads_viewed (upload_id);
