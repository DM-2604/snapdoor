const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Verify current state first
  const before = await p.commissionRule.findMany({
    where: { cityId: null, zoneId: null, categoryId: null, storeId: null },
    select: { id: true, commissionPercent: true }
  });
  console.log('BEFORE:', JSON.stringify(before));

  if (before.length === 0) {
    console.log('No global rule found — nothing to update.');
    return;
  }

  // Update all global (Tier 5 fallback) rules to 10% per seed.ts spec
  const result = await p.commissionRule.updateMany({
    where: { cityId: null, zoneId: null, categoryId: null, storeId: null },
    data: { commissionPercent: 10.0 }
  });
  console.log(`Updated ${result.count} global commission rule(s) to 10%`);

  const after = await p.commissionRule.findMany({
    where: { cityId: null, zoneId: null, categoryId: null, storeId: null },
    select: { id: true, commissionPercent: true }
  });
  console.log('AFTER:', JSON.stringify(after));
}

main()
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); })
  .finally(() => p.$disconnect());
