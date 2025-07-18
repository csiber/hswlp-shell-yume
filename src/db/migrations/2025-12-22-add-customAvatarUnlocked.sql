-- Add custom_avatar_unlocked column if missing
ALTER TABLE user ADD COLUMN IF NOT EXISTS custom_avatar_unlocked INTEGER DEFAULT 0;
