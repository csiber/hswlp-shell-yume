-- Earlier migrations created the `user_badges` table with a `badge_id` column.
-- This migration switches to using a textual `badge_key` instead of the
-- numeric `badge_id` reference. We add the new column and migrate any existing
-- data if necessary.

ALTER TABLE user_badges ADD COLUMN badge_key TEXT;

UPDATE user_badges
SET badge_key = (
  SELECT slug FROM badges WHERE badges.id = user_badges.badge_id
)
WHERE badge_key IS NULL;

CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON user_badges (user_id);
CREATE INDEX IF NOT EXISTS user_badges_badge_key_idx ON user_badges (badge_key);
