-- Highlight collections metadata and enriched highlighted posts

CREATE TABLE IF NOT EXISTS highlight_collections (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  active_from DATETIME,
  active_to DATETIME,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_default INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_counter INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS highlight_collections_active_idx ON highlight_collections (is_active, active_from, active_to);
CREATE INDEX IF NOT EXISTS highlight_collections_display_idx ON highlight_collections (display_order);

INSERT INTO highlight_collections (id, slug, title, description, is_active, is_default, display_order)
SELECT 'hlc_marketplace_default', 'marketplace-featured', 'Marketplace kiemelések', 'Alapértelmezett kollekció a marketplace kiemelésekhez', 1, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM highlight_collections WHERE slug = 'marketplace-featured');

ALTER TABLE highlighted_posts
  ADD COLUMN collection_id TEXT NOT NULL DEFAULT 'hlc_marketplace_default'
  REFERENCES highlight_collections(id) ON DELETE CASCADE;
ALTER TABLE highlighted_posts ADD COLUMN display_from DATETIME;
ALTER TABLE highlighted_posts ADD COLUMN display_to DATETIME;
ALTER TABLE highlighted_posts ADD COLUMN description TEXT;

CREATE INDEX IF NOT EXISTS highlighted_posts_collection_idx ON highlighted_posts (collection_id);
CREATE INDEX IF NOT EXISTS highlighted_posts_display_idx ON highlighted_posts (display_from, display_to);

UPDATE highlighted_posts
   SET display_to = COALESCE(display_to, expires_at);

UPDATE highlighted_posts
   SET display_from = COALESCE(display_from, DATETIME('now'));

UPDATE highlighted_posts
   SET collection_id = 'hlc_marketplace_default'
 WHERE collection_id IS NULL OR collection_id = '';
