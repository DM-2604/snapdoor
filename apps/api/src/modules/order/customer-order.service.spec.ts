import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CartStatus,
  FulfillmentType,
  OrderChannel,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  RefundStatus,
  StoreStatus,
} from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { EventBusService } from '../../shared/events/event-bus.service';
import { CommissionResolverService } from '../platform-config/commission-resolver.service';
import { PlatformConfigService } from '../platform-config/platform-config.service';
import { InventoryService } from '../inventory/inventory.service';
import { CartService } from './cart.service';
import { PaymentService } from '../payment/payment.service';
import { OffersService } from '../offers/offers.service';
import { OrderSseService } from './order-sse.service';
import { OrderService } from './order.service';

const mockPrisma: any = {
  store: {
    findFirst: jest.fn(),
  },
  order: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  cart: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  cartItem: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  productVariant: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  orderStatusHistory: {
    create: jest.fn(),
  },
  refund: {
    create: jest.fn(),
  },
  $transaction: jest.fn((callback: any) =>
    Array.isArray(callback) ? Promise.all(callback) : callback(mockPrisma),
  ),
  $queryRaw: jest.fn().mockResolvedValue([]),
};

const mockEventBus: any = {
  emit: jest.fn(),
};

const mockInventoryService: any = {
  reserveStock: jest.fn(),
  releaseReservedStock: jest.fn(),
  commitReservedStock: jest.fn(),
  decrementDirectStock: jest.fn(),
};

const mockCommissionResolver: any = {
  resolve: jest.fn().mockResolvedValue(10),
};

const mockPlatformConfig: any = {
  getSetting: jest.fn(),
};

const mockCartService: any = {
  getCart: jest.fn(),
};

const mockPaymentService: any = {
  initiateRefund: jest.fn().mockResolvedValue({ id: 'rfnd-1' }),
};

const mockOffersService: any = {
  evaluateOffersForCart: jest.fn(),
};

const mockOrderSseService: any = {
  pushNewOrder: jest.fn(),
  subscribe: jest.fn(),
};

describe('OrderService - Customer Operations', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventBusService, useValue: mockEventBus },
        { provide: InventoryService, useValue: mockInventoryService },
        { provide: CommissionResolverService, useValue: mockCommissionResolver },
        { provide: PlatformConfigService, useValue: mockPlatformConfig },
        { provide: CartService, useValue: mockCartService },
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: OffersService, useValue: mockOffersService },
        { provide: OrderSseService, useValue: mockOrderSseService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    jest.clearAllMocks();
  });

  describe('customerCancelOrder', () => {
    it('cancels within takeaway grace window (120s), releases stock, and initiates refund if payment was SUCCESS', async () => {
      const placedAt = new Date(Date.now() - 30 * 1000); // 30s ago (within 120s window)
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'ord-1',
        storeId: 'store-1',
        customerId: 'cust-1',
        status: OrderStatus.PLACED,
        channel: OrderChannel.APP,
        fulfillmentType: FulfillmentType.TAKEAWAY,
        placedAt,
        createdAt: placedAt,
        items: [{ productVariantId: 'var-1', quantity: 2 }],
        payments: [{ id: 'pay-1', amount: 500, status: PaymentStatus.SUCCESS, method: PaymentMethod.UPI }],
      });

      mockPlatformConfig.getSetting.mockResolvedValue({ value: 120 });
      mockPrisma.order.update.mockResolvedValue({ id: 'ord-1', status: OrderStatus.CANCELLED });
      mockPrisma.orderStatusHistory.create.mockResolvedValue({});
      mockPrisma.refund.create.mockResolvedValue({ id: 'rfnd-1' });

      const result = await service.customerCancelOrder('ord-1', 'cust-1', {
        reason: 'Ordered by mistake',
      });

      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(mockInventoryService.releaseReservedStock).toHaveBeenCalledWith(
        'var-1',
        2,
        'cust-1',
        expect.anything(),
      );
      expect(mockPrisma.refund.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderId: 'ord-1',
            amount: 500,
            status: 'INITIATED',
          }),
        }),
      );
    });

    it('rejects cancellation after window has expired', async () => {
      const placedAt = new Date(Date.now() - 45 * 1000); // 45s ago (exceeds delivery 30s window)
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'ord-2',
        storeId: 'store-1',
        customerId: 'cust-1',
        status: OrderStatus.PLACED,
        fulfillmentType: FulfillmentType.STORE_DELIVERY,
        placedAt,
        createdAt: placedAt,
        items: [],
        payments: [],
      });

      mockPlatformConfig.getSetting.mockResolvedValue({ value: 30 });

      await expect(
        service.customerCancelOrder('ord-2', 'cust-1', { reason: 'test' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects cancellation if order status is already beyond ACCEPTED (e.g. READY_FOR_PICKUP)', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'ord-3',
        storeId: 'store-1',
        customerId: 'cust-1',
        status: OrderStatus.READY_FOR_PICKUP,
        fulfillmentType: FulfillmentType.TAKEAWAY,
        placedAt: new Date(),
        createdAt: new Date(),
        items: [],
        payments: [],
      });

      await expect(
        service.customerCancelOrder('ord-3', 'cust-1', { reason: 'test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
