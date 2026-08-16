import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CartStatus, OrderStatus, StoreStatus } from '@prisma/client';
import { PrismaService } from '../src/shared/database/prisma.service';
import { EventBusService } from '../src/shared/events/event-bus.service';
import { CommissionResolverService } from '../src/modules/platform-config/commission-resolver.service';
import { PlatformConfigService } from '../src/modules/platform-config/platform-config.service';
import { InventoryService } from '../src/modules/inventory/inventory.service';
import { CartService } from '../src/modules/order/cart.service';
import { OrderService } from '../src/modules/order/order.service';
import { RatingsService } from '../src/modules/ratings/ratings.service';

describe('Customer Multi-Tenant & Data Isolation Suite', () => {
  let cartService: CartService;
  let orderService: OrderService;
  let ratingsService: RatingsService;

  let mockPrisma: any;
  let mockEventBus: any;
  let mockInventoryService: any;
  let mockPlatformConfig: any;
  let mockCommissionResolver: any;

  beforeEach(async () => {
    mockPrisma = {
      cart: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      cartItem: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      order: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      review: {
        findFirst: jest.fn(),
        create: jest.fn(),
        aggregate: jest.fn(),
      },
      store: {
        findFirst: jest.fn(),
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
    };

    mockEventBus = { emit: jest.fn() };
    mockInventoryService = {
      reserveStock: jest.fn(),
      releaseReservedStock: jest.fn(),
      commitReservedStock: jest.fn(),
      decrementDirectStock: jest.fn(),
    };
    mockPlatformConfig = { getSetting: jest.fn() };
    mockCommissionResolver = { resolve: jest.fn().mockResolvedValue(10) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        OrderService,
        RatingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventBusService, useValue: mockEventBus },
        { provide: InventoryService, useValue: mockInventoryService },
        { provide: PlatformConfigService, useValue: mockPlatformConfig },
        { provide: CommissionResolverService, useValue: mockCommissionResolver },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
    orderService = module.get<OrderService>(OrderService);
    ratingsService = module.get<RatingsService>(RatingsService);
    jest.clearAllMocks();
  });

  describe('Cart Isolation', () => {
    it('prevents customer B from modifying items in customer A active cart', async () => {
      // Mock cart item belongs to customer A cart, not customer B
      mockPrisma.cartItem.findFirst.mockImplementation(({ where }: any) => {
        // Customer B is querying, but item is in Customer A's cart
        if (where.cart?.customerId === 'cust-B') {
          return Promise.resolve(null);
        }
        return Promise.resolve({
          id: 'item-1',
          cartId: 'cart-cust-A',
          cart: { customerId: 'cust-A', status: CartStatus.ACTIVE, storeId: 'store-1' },
          productVariant: { inventory: { quantity: 10, reservedQuantity: 0 } },
        });
      });

      await expect(
        cartService.updateItem('cust-B', 'item-1', { quantity: 5 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('prevents customer B from deleting items from customer A active cart', async () => {
      mockPrisma.cartItem.findFirst.mockResolvedValue(null);

      await expect(
        cartService.removeItem('cust-B', 'item-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Order Isolation', () => {
    it('prevents customer B from viewing customer A order details', async () => {
      mockPrisma.order.findFirst.mockImplementation(({ where }: any) => {
        if (where.id === 'ord-cust-A' && where.customerId === 'cust-B') {
          return Promise.resolve(null);
        }
        return Promise.resolve({ id: 'ord-cust-A', customerId: 'cust-A' });
      });

      await expect(
        orderService.getCustomerOrderById('ord-cust-A', 'cust-B'),
      ).rejects.toThrow(NotFoundException);
    });

    it('prevents customer B from cancelling customer A order', async () => {
      mockPrisma.order.findFirst.mockImplementation(({ where }: any) => {
        if (where.id === 'ord-cust-A' && where.customerId === 'cust-B') {
          return Promise.resolve(null);
        }
        return Promise.resolve({ id: 'ord-cust-A', customerId: 'cust-A' });
      });

      await expect(
        orderService.customerCancelOrder('ord-cust-A', 'cust-B', { reason: 'malicious cancel' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('prevents customer B from reordering customer A order', async () => {
      mockPrisma.order.findFirst.mockImplementation(({ where }: any) => {
        if (where.id === 'ord-cust-A' && where.customerId === 'cust-B') {
          return Promise.resolve(null);
        }
        return Promise.resolve({ id: 'ord-cust-A', customerId: 'cust-A' });
      });

      await expect(
        orderService.reorder('ord-cust-A', 'cust-B', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Review Isolation', () => {
    it('prevents customer B from submitting a review for customer A order', async () => {
      mockPrisma.order.findFirst.mockImplementation(({ where }: any) => {
        if (where.id === 'ord-cust-A' && where.customerId === 'cust-B') {
          return Promise.resolve(null);
        }
        return Promise.resolve({ id: 'ord-cust-A', customerId: 'cust-A' });
      });

      await expect(
        ratingsService.createReview('ord-cust-A', 'cust-B', { rating: 5, reviewText: 'Nice' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
