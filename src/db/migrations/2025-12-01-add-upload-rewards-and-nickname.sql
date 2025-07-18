CREATE TABLE IF NOT EXISTS upload_rewards (
  id TEXT PRIMARY KEY,
  upload_id TEXT NOT NULL,
  uploader_id TEXT NOT NULL,
  viewer_id TEXT NOT NULL,
  event TEXT NOT NULL,
  points_awarded REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(upload_id, viewer_id, event)
);
ALTER TABLE user ADD COLUMN nickname TEXT UNIQUE NOT NULL DEFAULT 'anon';
ALTER TABLE uploads ADD COLUMN total_generated_points REAL DEFAULT 0;
