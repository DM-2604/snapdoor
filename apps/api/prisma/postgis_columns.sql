-- PostGIS geography columns & spatial indexes
-- Run this AFTER `prisma migrate dev` creates the tables.
-- These columns use geography types that Prisma cannot model (Unsupported()),
-- so they must be added separately.

-- ─── Geography columns ────────────────────────────────────────────────────────

ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS center_location geography(Point, 4326) NULL;

ALTER TABLE zones
  ADD COLUMN IF NOT EXISTS boundary geography(Polygon, 4326) NULL,
  ADD COLUMN IF NOT EXISTS centroid geography(Point, 4326) NULL;

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS location geography(Point, 4326) NULL;

-- ─── GIST indexes (PostGIS spatial queries) ───────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_stores_location_gist
  ON stores USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_zones_boundary_gist
  ON zones USING GIST (boundary);

CREATE INDEX IF NOT EXISTS idx_cities_center_gist
  ON cities USING GIST (center_location);

-- ─── GIN indexes (JSONB) ──────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_attributes_gin
  ON products USING GIN (attributes jsonb_path_ops)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_admin_users_permissions_gin
  ON admin_users USING GIN (permissions jsonb_path_ops)
  WHERE deleted_at IS NULL;

-- ─── Partial indexes (hot-path soft-delete tables) ───────────────────────────

CREATE INDEX IF NOT EXISTS idx_users_phone_active
  ON users (phone_number)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_stores_status_active
  ON stores (city_id, status)
  WHERE deleted_at IS NULL AND status = 'LIVE';

CREATE INDEX IF NOT EXISTS idx_products_store_active
  ON products (store_id, is_active)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_commission_rules_store
  ON commission_rules (store_id)
  WHERE store_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_commission_rules_zone
  ON commission_rules (zone_id)
  WHERE zone_id IS NOT NULL AND store_id IS NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_documents_owner
  ON documents (owner_type, owner_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payout_accounts_owner
  ON payout_accounts (owner_type, owner_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_user_active
  ON sessions (user_id)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sales_product_active
  ON sales (product_id)
  WHERE product_id IS NOT NULL AND is_active = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sales_store_category_active
  ON sales (store_id, category_id)
  WHERE is_active = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_carousels_placement_active
  ON carousels (placement, platform, city_id)
  WHERE is_active = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_carousel_slides_active
  ON carousel_slides (carousel_id, sort_order)
  WHERE is_active = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_themes_active
  ON themes (platform, city_id)
  WHERE is_active = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user
  ON notification_preferences (user_id)
  WHERE deleted_at IS NULL;

-- ─── pg_trgm text search indexes ────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_stores_name_trgm
  ON stores USING GIN (name gin_trgm_ops)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON products USING GIN (name gin_trgm_ops)
  WHERE deleted_at IS NULL;

-- ─── Platform defaults ───────────────────────────────────────────────────────
-- Global commission fallback (tier 5 — applies when no store/zone/category rule matches)

INSERT INTO commission_rules (
  id, city_id, zone_id, category_id, store_id,
  commission_percent, effective_from, reason, created_at, updated_at
)
SELECT
  gen_random_uuid(), NULL, NULL, NULL, NULL,
  6.00, NOW(),
  'Platform global default — tier 5 fallback (§0.3)',
  NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM commission_rules
  WHERE city_id IS NULL AND zone_id IS NULL
    AND category_id IS NULL AND store_id IS NULL
    AND deleted_at IS NULL
);

INSERT INTO platform_settings (id, key, value, description, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'cod_allowed_platform_wide',  'false', 'Global COD toggle', NOW(), NOW()),
  (gen_random_uuid(), 'min_order_value_default',     '0',     'Min order value INR', NOW(), NOW()),
  (gen_random_uuid(), 'max_delivery_radius_km',      '10',    'Max store delivery radius km', NOW(), NOW()),
  (gen_random_uuid(), 'otp_expiry_seconds',          '300',   'OTP validity in seconds', NOW(), NOW()),
  (gen_random_uuid(), 'otp_max_attempts',            '5',     'Max OTP attempts before lockout', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
