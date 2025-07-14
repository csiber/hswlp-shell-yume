CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  name TEXT,
  description TEXT,
  icon_url TEXT,
  category TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  badge_id TEXT,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
