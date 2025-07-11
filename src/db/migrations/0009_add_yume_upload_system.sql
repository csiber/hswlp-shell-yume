-- Feltöltések (képek, zenék, promtok)
CREATE TABLE uploads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK(type IN ('image', 'music', 'prompt')) NOT NULL,
  url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Kedvencek (csillagozás)
CREATE TABLE favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  upload_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (upload_id) REFERENCES uploads(id)
);

-- Lejátszási listák
CREATE TABLE playlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lejátszási lista elemek
CREATE TABLE playlist_items (
  id TEXT PRIMARY KEY,
  playlist_id TEXT NOT NULL,
  upload_id TEXT NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (playlist_id) REFERENCES playlists(id),
  FOREIGN KEY (upload_id) REFERENCES uploads(id)
);