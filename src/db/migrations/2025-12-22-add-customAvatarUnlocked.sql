-- Add customAvatarUnlocked column if missing
ALTER TABLE user ADD COLUMN IF NOT EXISTS customAvatarUnlocked INTEGER DEFAULT 0;
