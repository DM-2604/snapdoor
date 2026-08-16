import { Injectable, Logger } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule'; // ← uncomment in Phase 2 to enable scheduled execution
import { PrismaService } from '../../shared/database/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { STALE_ORDER_TIMEOUT_MINUTES } from '../order/order.constants';

/**
 * Auto-cancels stale orders that the store failed to act on.
 *
 * Phase 1: @Cron decorator is commented out — this class is registered as a
 * provider so the logic can be tested manually, but it will NOT run on a schedule.
 *
 * Phase 2: un-comment the @Cron decorator and add ScheduleModule.forRoot() to AppModule.
 */
@Injectable()
export class OrderTimeoutJob {
  private readonly logger = new Logger(OrderTimeoutJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

  // @Cron('*/5 * * * *') // ← uncomment in Phase 2 to run every 5 minutes
  async cancelStaleOrders(): Promise<void> {
    const staleThreshold = new Date(Date.now() - STALE_ORDER_TIMEOUT_MINUTES * 60_000);

    // Cancel PLACED orders older than 15 min with no store action
    const stalePlaced = await this.prisma.order.findMany({
      where: { status: 'PLACED', createdAt: { lt: staleThreshold } },
      include: { items: true },
    });

    // Cancel PAY_AT_PICKUP orders with INITIATED payment older than 2 hours
    const noShowThreshold = new Date(Date.now() - 120 * 60_000);
    const staleNoShows = await this.prisma.order.findMany({
      where: {
        status: { in: ['ACCEPTED', 'READY_FOR_PICKUP'] },
        paymentMethod: 'PAY_AT_PICKUP',
        payments: {
          some: {
            status: 'INITIATED',
          },
        },
        createdAt: { lt: noShowThreshold },
      },
      include: { items: true },
    });

    const allStaleOrders = [...stalePlaced, ...staleNoShows];

    for (const order of allStaleOrders as any[]) {
      try {
        await this.prisma.$transaction(async (tx) => {
          // Release reserved stock for each line item
          for (const item of order.items) {
            await this.inventoryService.releaseReservedStock(
              item.productVariantId,
              item.quantity,
              undefined,
              tx,
            );
          }

          await tx.order.update({
            where: { id: order.id },
            data: { status: 'CANCELLED' },
          });

          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              fromStatus: order.status,
              toStatus: 'CANCELLED',
              reason: 'AUTO_CANCELLED_TIMEOUT',
            },
          });
          // Payment was INITIATED → no refund row needed
        });

        this.logger.log(`Auto-cancelled stale order ${order.id} (${order.orderNumber})`);
      } catch (err) {
        this.logger.error(`Failed to auto-cancel order ${order.id}`, err);
        // Continue — one failure must not block the others
      }
    }
  }
}
