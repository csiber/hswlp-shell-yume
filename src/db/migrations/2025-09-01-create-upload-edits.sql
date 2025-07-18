CREATE TABLE IF NOT EXISTS upload_edits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upload_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS upload_edits_upload_id_idx ON upload_edits (upload_id);
CREATE INDEX IF NOT EXISTS upload_edits_user_id_idx ON upload_edits (user_id);

