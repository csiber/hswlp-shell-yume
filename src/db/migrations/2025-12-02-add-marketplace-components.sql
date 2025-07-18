-- Marketplace tables and user fields for extra components

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id)
);

-- Highlighted posts
CREATE TABLE IF NOT EXISTS highlighted_posts (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES user(id)
);

-- Marketplace activations log
CREATE TABLE IF NOT EXISTS marketplace_activations (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  component_id TEXT,
  activated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT
);

-- Additional user fields for marketplace extras
ALTER TABLE user ADD COLUMN profile_frame_enabled INTEGER DEFAULT 0;
ALTER TABLE user ADD COLUMN custom_avatar_unlocked INTEGER DEFAULT 0;
ALTER TABLE user ADD COLUMN selected_avatar_style TEXT;
ALTER TABLE user ADD COLUMN pinned_post_id TEXT;
ALTER TABLE user ADD COLUMN emoji_reactions_enabled INTEGER DEFAULT 0;
ALTER TABLE user ADD COLUMN points INTEGER DEFAULT 0;
ALTER TABLE user ADD COLUMN bonus_frame INTEGER DEFAULT 0;
ALTER TABLE user ADD COLUMN badge_unlocked INTEGER DEFAULT 0;
