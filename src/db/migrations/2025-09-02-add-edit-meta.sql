ALTER TABLE upload_edits ADD COLUMN hash TEXT;
ALTER TABLE uploads ADD COLUMN moderation_status TEXT DEFAULT 'approved';

