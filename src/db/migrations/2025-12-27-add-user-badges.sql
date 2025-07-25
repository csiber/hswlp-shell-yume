CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id),
  badge_key TEXT NOT NULL,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON user_badges (user_id);
CREATE INDEX IF NOT EXISTS user_badges_badge_key_idx ON user_badges (badge_key);
