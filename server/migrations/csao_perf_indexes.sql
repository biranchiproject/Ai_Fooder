-- CSAO Production Fix: DB Performance Indexes
-- Phase 3: Prevent full-table scans on candidate retrieval queries
-- Run this migration on your Render Postgres to activate indexes.

-- =============================================================
-- Table: restaurants
-- =============================================================
-- Candidate retrieval filters by city + is_open
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants (city);
CREATE INDEX IF NOT EXISTS idx_restaurants_city_open ON restaurants (city, is_open);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_bestseller ON restaurants (is_bestseller);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants (owner_id);

-- =============================================================
-- Table: menu_items
-- =============================================================
-- Candidate retrieval filters by category + price
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items (category);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_type ON menu_items (type);

-- Composite index for getCandidates() query: category + restaurant join
CREATE INDEX IF NOT EXISTS idx_menu_items_cat_restaurant ON menu_items (category, restaurant_id);

-- =============================================================
-- Table: item_affinity
-- =============================================================
-- getItemAffinity() queries by base_item_id + score ordering
CREATE INDEX IF NOT EXISTS idx_item_affinity_base_item ON item_affinity (base_item_id);
CREATE INDEX IF NOT EXISTS idx_item_affinity_base_score ON item_affinity (base_item_id, score DESC);

-- =============================================================
-- Table: recommendation_events
-- =============================================================
-- Analytics queries group by experiment_group + type
CREATE INDEX IF NOT EXISTS idx_rec_events_group ON recommendation_events (experiment_group);
CREATE INDEX IF NOT EXISTS idx_rec_events_type ON recommendation_events (type);
CREATE INDEX IF NOT EXISTS idx_rec_events_group_type ON recommendation_events (experiment_group, type);
CREATE INDEX IF NOT EXISTS idx_rec_events_cart_id ON recommendation_events (cart_id);
CREATE INDEX IF NOT EXISTS idx_rec_events_user ON recommendation_events (user_id);

-- Phase 4: Add order_value and cart_value columns if not exist
-- (Run this only once on clean DB — safe to re-run with IF NOT EXISTS)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='recommendation_events' AND column_name='order_value'
  ) THEN
    ALTER TABLE recommendation_events ADD COLUMN order_value INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='recommendation_events' AND column_name='cart_value'
  ) THEN
    ALTER TABLE recommendation_events ADD COLUMN cart_value INTEGER;
  END IF;
END $$;

-- Verify indexes
SELECT indexname, tablename, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('restaurants', 'menu_items', 'item_affinity', 'recommendation_events')
ORDER BY tablename, indexname;
