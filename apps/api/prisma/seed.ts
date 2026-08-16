/**
 * Prisma seed script — runs via: npm run db:seed
 *
 * Seeds:
 *  1. Default Ahmedabad city + one zone (Phase 1)
 *  2. Platform fee plan (Phase 1 flat ₹499/mo)
 *  3. Platform category taxonomy:
 *       — Top-level store verticals (Grocery, Pharmacy, Medical, Salon, Electronics, Bakery, etc.)
 *       — Curated product sub-categories under each vertical (for cross-store campaigns/commission rules)
 *  4. Default notification templates for all domain events
 *  5. Default theme
 *  6. Admin user (phone: +910000000000, role: ADMIN/SUPER_ADMIN)
 *  7. Demo store owner (phone: +910000000001)
 *  8. Demo store (status: PENDING) + StoreApprovalQueue row
 *  9. Global CommissionRule fallback (Tier 5, 10%)
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * ⚠️  REQUIRED TWO-STEP CREATE PATTERN FOR GEO COLUMNS
 * ──────────────────────────────────────────────────────────────────────────────
 * PostGIS geometry columns cannot be written by Prisma's generated client.
 * After EVERY prisma.store.create() and prisma.zone.create(), you MUST
 * immediately call the matching geo helper to set the geometry column.
 * Skipping the second step causes a NOT NULL geometry violation at runtime.
 *
 * Pattern:
 *   const zone = await prisma.zone.create({ data: { ... } });
 *   await setZoneCentroid(prisma, zone.id, lat, lng); // ← REQUIRED
 *
 * See apps/api/src/shared/database/geo.ts for implementation details.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from '@prisma/client';
import { setZoneCentroid, setStoreLocation } from '../src/shared/database/geo';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── 1. City: Ahmedabad ──────────────────────────────────────────────────────
  const ahmedabad = await prisma.city.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      timezone: 'Asia/Kolkata',
      status: 'ACTIVE',
      currencyCode: 'INR',
      isDeliveryFleetEnabled: false, // Phase 1 — toggle on for Phase 2
      defaultCommissionPercent: 6.0,
    },
  });
  console.log(`  ✓ City: ${ahmedabad.name}`);

  // ── 2. Zone: Ahmedabad West ─────────────────────────────────────────────────
  // Step 1: create the zone row
  const zone = await prisma.zone.upsert({
    where: { id: '00000000-0000-4000-8000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000002',
      cityId: ahmedabad.id,
      name: 'Ahmedabad West',
      code: 'AMD-W',
      isActive: true,
      defaultCommissionPercent: 6.0,
      storeCount: 0,
    },
  });
  // Step 2 (REQUIRED): set centroid via raw SQL — see header comment
  await setZoneCentroid(prisma as any, zone.id, 23.0225, 72.5714);
  console.log(`  ✓ Zone: ${zone.name} (${zone.code}) + centroid set`);

  // ── 3. Platform Fee Plan — Phase 1 flat ────────────────────────────────────
  const feePlan = await prisma.platformFeePlan.upsert({
    where: { id: '00000000-0000-4000-8000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000003',
      name: 'Phase 1 Flat Fee — ₹499/mo',
      planType: 'FLAT_MONTHLY',
      monthlyFee: 499.0,
      setupFee: 0.0,
      billingFrequency: 'MONTHLY',
      isActive: true,
      effectiveFrom: new Date('2026-01-01'),
    },
  });
  console.log(`  ✓ Fee Plan: ${feePlan.name}`);

  // ── 4. Global CommissionRule — Tier 5 fallback (10%) ───────────────────────
  // Ensures CommissionResolverService.resolve() always finds a rule.
  const existingGlobalRule = await prisma.commissionRule.findFirst({
    where: { cityId: null, zoneId: null, categoryId: null, storeId: null, deletedAt: null },
  });
  if (!existingGlobalRule) {
    await prisma.commissionRule.create({
      data: {
        commissionPercent: 10.0,
        effectiveFrom: new Date('2026-01-01'),
        reason: 'Platform global default (Tier 5 fallback) — seeded',
      },
    });
    console.log('  ✓ Global commission rule (10% Tier 5 fallback)');
  } else {
    console.log('  ↳ Global commission rule already exists — skipped');
  }

  // ── 5. Platform category taxonomy ──────────────────────────────────────────
  // Top-level verticals (what Store.businessCategoryId points to)
  const verticals = [
    { id: '00000000-0000-4000-8001-000000000001', name: 'Grocery', sortOrder: 1 },
    { id: '00000000-0000-4000-8001-000000000002', name: 'Pharmacy', sortOrder: 2 },
    { id: '00000000-0000-4000-8001-000000000003', name: 'Medical', sortOrder: 3 },
    { id: '00000000-0000-4000-8001-000000000004', name: 'Salon & Beauty', sortOrder: 4 },
    { id: '00000000-0000-4000-8001-000000000005', name: 'Electronics', sortOrder: 5 },
    { id: '00000000-0000-4000-8001-000000000006', name: 'Bakery', sortOrder: 6 },
    { id: '00000000-0000-4000-8001-000000000007', name: 'Stationery', sortOrder: 7 },
    { id: '00000000-0000-4000-8001-000000000008', name: 'Hardware & Tools', sortOrder: 8 },
    { id: '00000000-0000-4000-8001-000000000009', name: 'Restaurant', sortOrder: 9 },
  ];

  for (const cat of verticals) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: { ...cat, isActive: true },
    });
  }
  console.log(`  ✓ ${verticals.length} top-level store verticals`);

  // Curated product sub-categories under each vertical
  // These are the shared platform categories that cross-store campaigns and
  // commission rules can target (e.g. "20% off Dairy this weekend").
  // Store owners will point their products at these rows — they are NOT invented per-store.
  const subCategories = [
    // Grocery sub-categories
    { id: '00000000-0000-4000-8002-000000000001', parentId: '00000000-0000-4000-8001-000000000001', name: 'Dairy', sortOrder: 1 },
    { id: '00000000-0000-4000-8002-000000000002', parentId: '00000000-0000-4000-8001-000000000001', name: 'Snacks', sortOrder: 2 },
    { id: '00000000-0000-4000-8002-000000000003', parentId: '00000000-0000-4000-8001-000000000001', name: 'Beverages', sortOrder: 3 },
    { id: '00000000-0000-4000-8002-000000000004', parentId: '00000000-0000-4000-8001-000000000001', name: 'Fruits & Vegetables', sortOrder: 4 },
    { id: '00000000-0000-4000-8002-000000000005', parentId: '00000000-0000-4000-8001-000000000001', name: 'Grains & Pulses', sortOrder: 5 },
    { id: '00000000-0000-4000-8002-000000000006', parentId: '00000000-0000-4000-8001-000000000001', name: 'Oils & Condiments', sortOrder: 6 },
    // Pharmacy sub-categories
    { id: '00000000-0000-4000-8002-000000000007', parentId: '00000000-0000-4000-8001-000000000002', name: 'Medicines', sortOrder: 1 },
    { id: '00000000-0000-4000-8002-000000000008', parentId: '00000000-0000-4000-8001-000000000002', name: 'Personal Care', sortOrder: 2 },
    { id: '00000000-0000-4000-8002-000000000009', parentId: '00000000-0000-4000-8001-000000000002', name: 'Baby Care', sortOrder: 3 },
    { id: '00000000-0000-4000-8002-000000000010', parentId: '00000000-0000-4000-8001-000000000002', name: 'Vitamins & Supplements', sortOrder: 4 },
    // Medical sub-categories
    { id: '00000000-0000-4000-8002-000000000011', parentId: '00000000-0000-4000-8001-000000000003', name: 'Diagnostics', sortOrder: 1 },
    { id: '00000000-0000-4000-8002-000000000012', parentId: '00000000-0000-4000-8001-000000000003', name: 'Equipment', sortOrder: 2 },
    // Salon sub-categories
    { id: '00000000-0000-4000-8002-000000000013', parentId: '00000000-0000-4000-8001-000000000004', name: 'Hair Care', sortOrder: 1 },
    { id: '00000000-0000-4000-8002-000000000014', parentId: '00000000-0000-4000-8001-000000000004', name: 'Skin Care', sortOrder: 2 },
    // Electronics sub-categories
    { id: '00000000-0000-4000-8002-000000000015', parentId: '00000000-0000-4000-8001-000000000005', name: 'Mobile Accessories', sortOrder: 1 },
    { id: '00000000-0000-4000-8002-000000000016', parentId: '00000000-0000-4000-8001-000000000005', name: 'Audio', sortOrder: 2 },
    { id: '00000000-0000-4000-8002-000000000017', parentId: '00000000-0000-4000-8001-000000000005', name: 'Cables & Adapters', sortOrder: 3 },
    // Bakery sub-categories
    { id: '00000000-0000-4000-8002-000000000018', parentId: '00000000-0000-4000-8001-000000000006', name: 'Bread & Buns', sortOrder: 1 },
    { id: '00000000-0000-4000-8002-000000000019', parentId: '00000000-0000-4000-8001-000000000006', name: 'Cakes & Pastries', sortOrder: 2 },
    { id: '00000000-0000-4000-8002-000000000020', parentId: '00000000-0000-4000-8001-000000000006', name: 'Cookies & Biscuits', sortOrder: 3 },
  ];

  for (const sub of subCategories) {
    await prisma.category.upsert({
      where: { id: sub.id },
      update: {},
      create: {
        id: sub.id,
        parentCategoryId: sub.parentId,
        name: sub.name,
        sortOrder: sub.sortOrder,
        isActive: true,
      },
    });
  }
  console.log(`  ✓ ${subCategories.length} platform product sub-categories`);

  // ── 6. Notification templates ───────────────────────────────────────────────
  const templates = [
    // Customer push
    { eventKey: 'order.placed', channel: 'PUSH' as const, language: 'en', templateBody: 'Your order #{{order_number}} has been placed! The store will confirm shortly.' },
    { eventKey: 'order.accepted', channel: 'PUSH' as const, language: 'en', templateBody: 'Great news! {{store_name}} accepted your order #{{order_number}} and is preparing it.' },
    { eventKey: 'order.rejected', channel: 'PUSH' as const, language: 'en', templateBody: 'Order #{{order_number}} was rejected by {{store_name}}. Reason: {{reason}}. A refund will be initiated.' },
    { eventKey: 'order.ready', channel: 'PUSH' as const, language: 'en', templateBody: 'Your order #{{order_number}} is ready for pickup at {{store_name}}!' },
    { eventKey: 'order.out_for_delivery', channel: 'PUSH' as const, language: 'en', templateBody: 'Your order #{{order_number}} is on the way!' },
    { eventKey: 'order.completed', channel: 'PUSH' as const, language: 'en', templateBody: 'Order #{{order_number}} delivered. How was your experience? Leave a review!' },
    // Store owner push
    { eventKey: 'order.placed', channel: 'PUSH' as const, language: 'en-store', templateBody: 'New order #{{order_number}} — ₹{{total_amount}}. Tap to accept.' },
    { eventKey: 'inventory.low_stock', channel: 'PUSH' as const, language: 'en', templateBody: '⚠️ Low stock alert: {{product_name}} has only {{quantity}} units left.' },
    { eventKey: 'store.went_live', channel: 'PUSH' as const, language: 'en', templateBody: '🎉 Your store {{store_name}} is now live on LocalMart!' },
    // SMS
    { eventKey: 'auth.otp_requested', channel: 'SMS' as const, language: 'en', templateBody: '{{otp}} is your LocalMart verification code. Valid for 5 minutes. Do not share.' },
    { eventKey: 'order.completed', channel: 'SMS' as const, language: 'en', templateBody: 'LocalMart: Order #{{order_number}} delivered. Rate your experience at {{review_url}}' },
  ];

  for (const t of templates) {
    await prisma.notificationTemplate.upsert({
      where: { eventKey_channel_language: { eventKey: t.eventKey, channel: t.channel, language: t.language } },
      update: {},
      create: t,
    });
  }
  console.log(`  ✓ ${templates.length} notification templates`);

  // ── 7. Default theme ────────────────────────────────────────────────────────
  await prisma.theme.upsert({
    where: { id: '00000000-0000-4000-8002-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8002-000000000001',
      name: 'Default',
      platform: 'BOTH',
      isDefault: true,
      primaryColorHex: '#22C55E',
      secondaryColorHex: '#16A34A',
      accentColorHex: '#F97316',
      isActive: true,
    },
  });
  console.log('  ✓ Default theme');

  // ── 8. Admin user ───────────────────────────────────────────────────────────
  // Use phone +910000000000 to log into admin-web without manual DB edits.
  const adminUser = await prisma.user.upsert({
    where: { id: '00000000-0000-4000-8003-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8003-000000000001',
      phoneNumber: '+910000000000',
      name: 'Platform Admin',
      role: 'ADMIN',
    },
  });
  await prisma.adminUser.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      adminRole: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log(`  ✓ Admin user: ${adminUser.phoneNumber} (SUPER_ADMIN)`);

  // ── 9. Demo store owner ─────────────────────────────────────────────────────
  const storeOwnerUser = await prisma.user.upsert({
    where: { id: '00000000-0000-4000-8003-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-4000-8003-000000000002',
      phoneNumber: '+910000000001',
      name: 'Demo Store Owner',
      email: 'demo@localmart.in',
      role: 'STORE_OWNER',
    },
  });
  await prisma.storeOwner.upsert({
    where: { userId: storeOwnerUser.id },
    update: {},
    create: {
      userId: storeOwnerUser.id,
      kycStatus: 'PENDING',
    },
  });
  console.log(`  ✓ Store owner: ${storeOwnerUser.phoneNumber}`);

  // ── 10. Demo store (PENDING) ─────────────────────────────────────────────────
  // Step 1: create the store row
  const demoStore = await prisma.store.upsert({
    where: { id: '00000000-0000-4000-8004-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8004-000000000001',
      ownerUserId: storeOwnerUser.id,
      cityId: ahmedabad.id,
      zoneId: zone.id,
      storeCode: 'DEMO-001',
      name: 'Demo Grocery Store',
      description: 'A demo store for admin approval testing',
      businessCategoryId: '00000000-0000-4000-8001-000000000001', // Grocery vertical
      address: '123 SG Highway, Ahmedabad, Gujarat 380015',
      status: 'PENDING',
      onboardingSource: 'SELF_SERVE',
      takeawayEnabled: true,
      deliveryEnabled: false,
    },
  });

  // Step 2 (REQUIRED): set location via raw SQL — see header comment
  await setStoreLocation(prisma as any, demoStore.id, 23.0225, 72.5714);
  console.log(`  ✓ Demo store: ${demoStore.name} (PENDING) + location set`);

  // ── 11. StoreApprovalQueue row for demo store ────────────────────────────────
  const existingQueueRow = await prisma.storeApprovalQueue.findFirst({
    where: { storeId: demoStore.id },
  });
  if (!existingQueueRow) {
    await prisma.storeApprovalQueue.create({
      data: {
        storeId: demoStore.id,
        decision: 'PENDING',
      },
    });
    console.log('  ✓ StoreApprovalQueue row for demo store');
  } else {
    console.log('  ↳ StoreApprovalQueue row already exists — skipped');
  }

  console.log('\n✅ Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
