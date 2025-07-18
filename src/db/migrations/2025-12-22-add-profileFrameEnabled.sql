-- Adds profileFrameEnabled column if it does not exist
ALTER TABLE user ADD COLUMN IF NOT EXISTS profileFrameEnabled INTEGER DEFAULT 0;
