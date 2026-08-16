// Implements v3 §D — PostGIS raw SQL helpers for geometry columns
//
// WHY RAW SQL: Prisma marks PostGIS geography columns as Unsupported() in the schema,
// so they cannot be read/written via the generated Prisma Client CRUD methods.
// All geometry operations MUST go through prisma.$executeRaw / prisma.$queryRaw.
//
// ⚠️  IMPORTANT — ST_MakePoint argument order:
//   ST_MakePoint(longitude, latitude) — longitude FIRST, always.
//   These helpers accept (lat, lng) for caller convenience and swap internally.
//
// ──────────────────────────────────────────────────────────────────────────────
// REQUIRED TWO-STEP CREATE PATTERN
// ──────────────────────────────────────────────────────────────────────────────
// Because Prisma cannot write the geometry column in a single create(), you MUST
// call the matching geo helper immediately after every prisma.store.create() and
// prisma.zone.create(). Skipping the second step causes a NOT NULL violation at
// runtime if the DB column is configured NOT NULL.
//
// Example:
//   const store = await prisma.store.create({ data: { ... } });
//   await setStoreLocation(prisma, store.id, lat, lng); // ← REQUIRED
//
// ──────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

/**
 * Set the PostGIS geography(Point) for a store's `location` column.
 * Call this immediately after every prisma.store.create().
 *
 * @param lat  Latitude  (degrees, WGS-84)
 * @param lng  Longitude (degrees, WGS-84)
 */
export async function setStoreLocation(
  prisma: PrismaClient,
  storeId: string,
  lat: number,
  lng: number,
): Promise<void> {
  await prisma.$executeRaw(
    Prisma.sql`
      UPDATE stores
      SET    location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
      WHERE  id = ${storeId}::uuid
    `,
  );
}

/**
 * Set the PostGIS geography(Point) for a zone's `centroid` column.
 * Call this immediately after every prisma.zone.create().
 *
 * Zone polygon boundary drawing is explicitly OUT OF SCOPE for Phase 1 — see DECISIONS.md §3.
 * The `boundary` column remains null until the map UI feature is built.
 *
 * @param lat  Latitude  (degrees, WGS-84)
 * @param lng  Longitude (degrees, WGS-84)
 */
export async function setZoneCentroid(
  prisma: PrismaClient,
  zoneId: string,
  lat: number,
  lng: number,
): Promise<void> {
  await prisma.$executeRaw(
    Prisma.sql`
      UPDATE zones
      SET    centroid = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
      WHERE  id = ${zoneId}::uuid
    `,
  );
}

/**
 * Read the decoded lat/lng for a store's `location` column.
 * Returns null if the location has not been set yet.
 */
export async function getStoreLocation(
  prisma: PrismaClient,
  storeId: string,
): Promise<{ lat: number; lng: number } | null> {
  const rows = await prisma.$queryRaw<{ lat: number; lng: number }[]>(
    Prisma.sql`
      SELECT ST_Y(location::geometry) AS lat,
             ST_X(location::geometry) AS lng
      FROM   stores
      WHERE  id = ${storeId}::uuid
        AND  location IS NOT NULL
    `,
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Find stores within a given radius (in meters) of a point.
 * Returns raw rows including computed distance.
 * Used by admin/internal queries. For customer-facing discovery, use findStoresDeliverableTo.
 */
export async function findStoresWithinRadius(
  prisma: PrismaClient,
  lat: number,
  lng: number,
  radiusMeters: number,
): Promise<any[]> {
  const rows = await prisma.$queryRaw<any[]>(
    Prisma.sql`
      SELECT 
        id, 
        store_code as "storeCode",
        name,
        description,
        business_category_id as "businessCategoryId",
        address,
        photos,
        takeaway_enabled as "takeawayEnabled",
        delivery_enabled as "deliveryEnabled",
        delivery_radius_km as "deliveryRadiusKm",
        delivery_fee as "deliveryFee",
        avg_prep_time_minutes as "avgPrepTimeMinutes",
        is_temporarily_paused as "isTemporarilyPaused",
        status,
        ST_Distance(location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)) AS "distanceMeters",
        ST_Y(location::geometry) AS lat,
        ST_X(location::geometry) AS lng
      FROM stores
      WHERE status = 'LIVE' 
        AND deleted_at IS NULL
        AND location IS NOT NULL
        AND ST_DWithin(
          location,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          ${radiusMeters}
        )
      ORDER BY "distanceMeters" ASC
    `,
  );
  return rows;
}

/**
 * Find LIVE stores that can deliver to a given customer location,
 * filtered by each store's OWN admin-set delivery_radius_km.
 *
 * A store appears only when the customer is within that store's configured
 * delivery radius — so a store with deliveryRadiusKm = 3 will only show up
 * if the customer is ≤ 3 km away from it.
 *
 * Use this for all customer-facing store discovery (GET /customer/stores/nearby).
 */
export async function findStoresDeliverableTo(
  prisma: PrismaClient,
  lat: number,
  lng: number,
): Promise<any[]> {
  const rows = await prisma.$queryRaw<any[]>(
    Prisma.sql`
      SELECT
        id,
        store_code            AS "storeCode",
        name,
        description,
        business_category_id  AS "businessCategoryId",
        address,
        photos,
        takeaway_enabled      AS "takeawayEnabled",
        delivery_enabled      AS "deliveryEnabled",
        delivery_radius_km    AS "deliveryRadiusKm",
        delivery_fee          AS "deliveryFee",
        avg_prep_time_minutes AS "avgPrepTimeMinutes",
        is_temporarily_paused AS "isTemporarilyPaused",
        status,
        ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        )                     AS "distanceMeters",
        ST_Y(location::geometry) AS lat,
        ST_X(location::geometry) AS lng
      FROM stores
      WHERE status            = 'LIVE'
        AND deleted_at        IS NULL
        AND location          IS NOT NULL
        AND delivery_radius_km IS NOT NULL
        AND ST_DWithin(
          location,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          (delivery_radius_km::float * 1000)
        )
      ORDER BY "distanceMeters" ASC
    `,
  );
  return rows;
}

