CREATE TABLE IF NOT EXISTS email_campaigns (
  id TEXT PRIMARY KEY,
  campaign_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  eligibility_criteria TEXT NOT NULL,
  throttle_hours INTEGER NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updateCounter INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS email_campaign_key_idx ON email_campaigns(campaign_key);

CREATE TABLE IF NOT EXISTS email_campaign_runs (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES email_campaigns(id),
  user_id TEXT NOT NULL REFERENCES user(id),
  run_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'sent',
  error TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updateCounter INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS email_campaign_runs_campaign_idx ON email_campaign_runs(campaign_id);
CREATE INDEX IF NOT EXISTS email_campaign_runs_user_idx ON email_campaign_runs(user_id);
CREATE INDEX IF NOT EXISTS email_campaign_runs_run_at_idx ON email_campaign_runs(run_at);
