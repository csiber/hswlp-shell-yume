ALTER TABLE albums ADD COLUMN cover_file_id TEXT;
CREATE INDEX IF NOT EXISTS albums_user_id_idx ON albums (user_id);
CREATE INDEX IF NOT EXISTS uploads_album_id_idx ON uploads (album_id);
