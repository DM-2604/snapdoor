import { Prisma } from '@prisma/client';

/**
 * Generates a collision-safe order number using a PostgreSQL sequence.
 * Format: ORD-YYYYMMDD-{seq}
 */
export async function nextOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const result = await tx.$queryRaw<[{ nextval: bigint }]>`
    SELECT nextval('order_number_seq')`;
  const nextval = result[0].nextval;
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `ORD-${date}-${nextval}`;
}

/**
 * Generates a collision-safe POS order number using a PostgreSQL sequence.
 * Format: POS-YYYYMMDD-{seq}
 */
export async function nextPosOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const result = await tx.$queryRaw<[{ nextval: bigint }]>`
    SELECT nextval('order_number_seq')`;
  const nextval = result[0].nextval;
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `POS-${date}-${nextval}`;
}

/**
 * Generates a collision-safe sales invoice number using a PostgreSQL sequence.
 * Format: SINV-YYYYMMDD-{seq}
 */
export async function nextInvoiceNumber(tx: Prisma.TransactionClient): Promise<string> {
  const result = await tx.$queryRaw<[{ nextval: bigint }]>`
    SELECT nextval('invoice_number_seq')`;
  const nextval = result[0].nextval;
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `SINV-${date}-${nextval}`;
}
