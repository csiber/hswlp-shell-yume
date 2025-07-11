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

-- Dummy feltöltések
INSERT INTO uploads (id, user_id, title, type, url)
VALUES 
  ('1', 'user1', 'Kép #1', 'image', '/media/kep1.jpg'),
  ('2', 'user1', 'Zene #2', 'music', '/media/zene2.mp3'),
  ('3', 'user1', 'Prompt #3', 'prompt', '/media/prompt3.txt'),
  ('4', 'user2', 'Trend #1', 'image', '/media/trend1.jpg'),
  ('5', 'user2', 'Trend #2', 'music', '/media/trend2.mp3'),
  ('6', 'user2', 'Trend #3', 'prompt', '/media/trend3.txt');

-- Dummy kedvencek
INSERT INTO favorites (id, user_id, upload_id)
VALUES 
  ('f1', 'user1', '4'),
  ('f2', 'user1', '5'),
  ('f3', 'user1', '6');

-- Dummy playlist
INSERT INTO playlists (id, user_id, name)
VALUES 
  ('pl1', 'user1', 'Playlist #1'),
  ('pl2', 'user1', 'Playlist #2'),
  ('pl3', 'user1', 'Kedvenc #3');

-- Dummy playlist elemek
INSERT INTO playlist_items (id, playlist_id, upload_id)
VALUES 
  ('pli1', 'pl1', '2'),
  ('pli2', 'pl2', '5'),
  ('pli3', 'pl3', '3');
