import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

/**
 * Check if an idempotency key already exists and has a cached response.
 * - If the key doesn't exist: returns (allows the request to proceed).
 * - If the key exists but is expired: returns (treats as a new request).
 * - If the key exists and is still valid: throws ConflictException with the original response body.
 *
 * Must be called OUTSIDE of a $transaction to avoid lock contention.
 */
export async function checkIdempotencyKey(
  prisma: PrismaService,
  key: string,
): Promise<void> {
  const record = await prisma.idempotencyKey.findUnique({ where: { key } });
  if (!record) return;
  if (record.expiresAt < new Date()) return; // expired — treat as new request
  throw new ConflictException({
    message: 'Duplicate request — original response returned',
    ...(record.responseBody as object),
  });
}

/**
 * Store the response of a successful request so that retries return the same result.
 * TTL is 24 hours.
 *
 * Must be called AFTER the $transaction commits — never inside a transaction.
 */
export async function setIdempotencyKey(
  prisma: PrismaService,
  key: string,
  responseBody: object,
): Promise<void> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h TTL
  await prisma.idempotencyKey.upsert({
    where: { key },
    create: { key, responseBody, expiresAt },
    update: { responseBody, expiresAt },
  });
}
