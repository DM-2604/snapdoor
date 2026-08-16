import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/shared/database/prisma.service';
import { InventoryService } from '../src/modules/inventory/inventory.service';
import { EventBusService } from '../src/shared/events/event-bus.service';
import { PaymentService } from '../src/modules/payment/payment.service';
import { RatingsController } from '../src/modules/ratings/ratings.controller';
import { RatingsService } from '../src/modules/ratings/ratings.service';

import { JwtAuthGuard } from '../src/shared/guards/jwt-auth.guard';
import { RolesGuard } from '../src/shared/guards/roles.guard';
import { StoreOwnerGuard } from '../src/shared/guards/store-owner.guard';

describe('Cross-Resource Isolation Suite (Controller/Service Level)', () => {
  let inventoryService: InventoryService;
  let paymentService: PaymentService;
  let ratingsController: RatingsController;

  let mockPrisma: any;
  let mockEventBus: any;

  beforeEach(async () => {
    mockPrisma = {
      inventory: {
        findFirst: jest.fn(),
      },
      payment: {
        findFirst: jest.fn(),
      },
      review: {
        findFirst: jest.fn(),
      },
      $queryRaw: jest.fn().mockResolvedValue([{ id: 'mock-raw-id' }]),
      $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
    };
    mockEventBus = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        PaymentService,
        RatingsController,
        RatingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .overrideGuard(StoreOwnerGuard).useValue({ canActivate: () => true })
      .compile();

    inventoryService = module.get<InventoryService>(InventoryService);
    paymentService = module.get<PaymentService>(PaymentService);
    ratingsController = module.get<RatingsController>(RatingsController);
    jest.clearAllMocks();
  });

  describe('1. InventoryController.adjustStock (Cross-store prevention)', () => {
    it('prevents store A owner from adjusting stock for store B product', async () => {
      // Mock returns inventory belonging to Store B
      mockPrisma.inventory.findFirst.mockResolvedValue({
        id: 'inv-1',
        quantity: 10,
        productVariant: {
          product: { storeId: 'store-B' },
          variantName: 'Test Variant',
        },
      });

      await expect(
        inventoryService.adjustStock('store-A', 'variant-1', 5, 'RESTOCK' as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('2. InventoryController.getVariantHistory (Cross-store read prevention)', () => {
    it('prevents store A owner from reading adjustment history for store B product', async () => {
      // Mock returns inventory belonging to Store B
      mockPrisma.inventory.findFirst.mockResolvedValue({
        id: 'inv-1',
        productVariant: {
          product: { storeId: 'store-B' },
        },
      });

      await expect(
        inventoryService.getAdjustmentHistory('store-A', 'variant-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('3. PaymentController.getPayment (Cross-user read prevention)', () => {
    it('prevents user A from fetching user B payment', async () => {
      // Stub
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: 'pay-1',
        order: { customerId: 'user-B' },
      });

      await expect(
        paymentService.getPayment('pay-1', 'user-A', 'CUSTOMER' as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('4. PaymentController.mockConfirm (Cross-user action prevention)', () => {
    it('prevents user A from confirming user B payment', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: 'pay-1',
        order: { customerId: 'user-B' },
      });

      await expect(
        paymentService.mockConfirm('pay-1', 'user-A', 'CUSTOMER' as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('5. PaymentController.initiateRefund (Cross-user refund prevention)', () => {
    it('prevents user A from refunding user B payment', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: 'pay-1',
        order: { customerId: 'user-B' },
      });

      await expect(
        paymentService.initiateRefund('pay-1', { reason: 'test' }, 'user-A', 'CUSTOMER' as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('6. RatingsController.replyToReview (Cross-store reply prevention)', () => {
    it('prevents store A owner from replying to a review belonging to store B', async () => {
      // Mock returns review belonging to Store B
      mockPrisma.review.findFirst.mockResolvedValue({
        id: 'rev-1',
        storeId: 'store-B',
        store: { ownerUserId: 'store-owner-B' },
      });

      await expect(
        ratingsController.replyToReview('rev-1', { reply: 'Thanks' }, { sub: 'store-owner-A' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
