-- Referral system for user invitations
ALTER TABLE user ADD COLUMN referred_by TEXT REFERENCES user(id);
CREATE TABLE IF NOT EXISTS referral_events (
  id TEXT PRIMARY KEY,
  referrer_id TEXT NOT NULL REFERENCES user(id),
  referred_user_id TEXT NOT NULL REFERENCES user(id),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  rewarded INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS referral_events_referrer_idx ON referral_events (referrer_id);
CREATE INDEX IF NOT EXISTS referral_events_referred_idx ON referral_events (referred_user_id);
