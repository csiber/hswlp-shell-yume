CREATE TABLE IF NOT EXISTS upload_versions (
  id TEXT PRIMARY KEY,
  upload_id TEXT,
  user_id TEXT,
  title TEXT,
  description TEXT,
  tags TEXT,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS upload_versions_upload_id_idx ON upload_versions (upload_id);
CREATE INDEX IF NOT EXISTS upload_versions_created_at_idx ON upload_versions (created_at);
ALTER TABLE uploads ADD COLUMN download_count INTEGER DEFAULT 0;
ALTER TABLE uploads ADD COLUMN locked BOOLEAN DEFAULT false;
