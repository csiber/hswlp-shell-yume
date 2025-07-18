-- Adds profile_frame_enabled column if it does not exist
ALTER TABLE user ADD COLUMN IF NOT EXISTS profile_frame_enabled INTEGER DEFAULT 0;
