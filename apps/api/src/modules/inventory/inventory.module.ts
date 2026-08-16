import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

/**
 * InventoryModule — bounded context
 * Stock counts, adjustments, low-stock alerts — seq 9.3
 * Sequence diagrams: 9.3 (low-stock alert, auto-disable)
 */
@Module({
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
