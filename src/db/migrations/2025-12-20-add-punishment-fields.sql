ALTER TABLE uploads ADD COLUMN moderation_reason TEXT;
ALTER TABLE user ADD COLUMN upload_ban_until TEXT;
CREATE TABLE user_punishments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  until TEXT
);
