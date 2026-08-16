-- CreateExtension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add location to stores
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "location" geography(Point, 4326);

-- Add centroid and boundary to zones
ALTER TABLE "zones" ADD COLUMN IF NOT EXISTS "centroid" geography(Point, 4326);
ALTER TABLE "zones" ADD COLUMN IF NOT EXISTS "boundary" geography(Polygon, 4326);

-- Add center_location to cities
ALTER TABLE "cities" ADD COLUMN IF NOT EXISTS "center_location" geography(Point, 4326);
