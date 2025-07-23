ALTER TABLE uploads ADD COLUMN "order" INTEGER;
CREATE INDEX IF NOT EXISTS uploads_album_order_idx ON uploads (album_id, "order");
