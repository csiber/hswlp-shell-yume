CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  date TIMESTAMP,
  location TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
