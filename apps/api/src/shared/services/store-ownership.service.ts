import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class StoreOwnershipService {
  constructor(private readonly prisma: PrismaService) {}

  async verifyStoreOwnership(userId: string, targetStoreId: string): Promise<void> {
    const store = await this.prisma.store.findFirst({
      where: { id: targetStoreId, ownerUserId: userId, deletedAt: null },
    });

    if (!store) {
      throw new NotFoundException(`Store not found`);
    }
  }
}
