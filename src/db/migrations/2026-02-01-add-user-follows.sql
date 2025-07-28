CREATE TABLE IF NOT EXISTS user_follows (
  id TEXT PRIMARY KEY,
  follower_id TEXT NOT NULL,
  followee_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, followee_id)
);
CREATE INDEX IF NOT EXISTS user_follows_follower_idx ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS user_follows_followee_idx ON user_follows(followee_id);
