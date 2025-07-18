-- PONTJUTALMI TÁBLA
CREATE TABLE IF NOT EXISTS upload_rewards (
    id TEXT PRIMARY KEY,
    upload_id TEXT NOT NULL,
    uploader_id TEXT NOT NULL,
    viewer_id TEXT NOT NULL,
    event TEXT NOT NULL,
    points_awarded REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (upload_id, viewer_id, event)
);

-- NICKNÉV HOZZÁADÁSA
ALTER TABLE user ADD COLUMN nickname TEXT;

-- EGYEDI NICK GENERÁLÁSA
UPDATE user
SET
    nickname = 'anon_' || substr(id, 1, 8)
WHERE
    nickname IS NULL;

-- UNIQUE INDEX HOZZÁADÁSA
CREATE UNIQUE INDEX idx_user_nickname ON user (nickname);

-- PONTÖSSZEG TÁROLÁSA
ALTER TABLE uploads ADD COLUMN total_generated_points REAL DEFAULT 0;