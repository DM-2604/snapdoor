import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CartStatus, StoreStatus } from '@prisma/client';
import { CartService } from './cart.service';
import { PrismaService } from '../../shared/database/prisma.service';

const mockPrisma: any = {
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
  store: {
    findFirst: jest.fn(),
  },
  productVariant: {
    findFirst: jest.fn(),
  },
};

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    jest.clearAllMocks();
  });

  describe('addItem', () => {
    it('throws 409 ConflictException when customer attempts to add item from a different store without confirmClearOtherCart', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue({
        id: 'cart-1',
        storeId: 'store-A',
        status: CartStatus.ACTIVE,
        store: { name: 'Store A Groceries' },
      });

      await expect(
        service.addItem('cust-1', {
          storeId: 'store-B',
          productVariantId: 'var-1',
          quantity: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('abandons existing cart from store A when confirmClearOtherCart is true', async () => {
      mockPrisma.cart.findFirst
        .mockResolvedValueOnce({
          id: 'cart-1',
          storeId: 'store-A',
          status: CartStatus.ACTIVE,
          store: { name: 'Store A Groceries' },
        })
        .mockResolvedValueOnce({
          id: 'cart-2',
          storeId: 'store-B',
          status: CartStatus.ACTIVE,
          store: { id: 'store-B', name: 'Store B', deliveryFee: 0 },
          items: [],
        });

      mockPrisma.store.findFirst.mockResolvedValue({
        id: 'store-B',
        status: StoreStatus.LIVE,
      });

      mockPrisma.productVariant.findFirst.mockResolvedValue({
        id: 'var-2',
        priceOverride: null,
        product: { id: 'prod-2', name: 'Apple', basePrice: 100, isActive: true, storeId: 'store-B' },
        inventory: { quantity: 10, reservedQuantity: 0 },
      });

      mockPrisma.cart.create.mockResolvedValue({
        id: 'cart-2',
        storeId: 'store-B',
        customerId: 'cust-1',
        status: CartStatus.ACTIVE,
      });

      mockPrisma.cartItem.findFirst.mockResolvedValue(null);
      mockPrisma.cartItem.create.mockResolvedValue({ id: 'item-1' });

      await service.addItem('cust-1', {
        storeId: 'store-B',
        productVariantId: 'var-2',
        quantity: 2,
        confirmClearOtherCart: true,
      });

      expect(mockPrisma.cart.update).toHaveBeenCalledWith({
        where: { id: 'cart-1' },
        data: { status: CartStatus.ABANDONED },
      });
      expect(mockPrisma.cartItem.create).toHaveBeenCalled();
    });

    it('rejects adding item if requested quantity exceeds available stock', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue(null);

      mockPrisma.store.findFirst.mockResolvedValue({
        id: 'store-A',
        status: StoreStatus.LIVE,
      });

      mockPrisma.productVariant.findFirst.mockResolvedValue({
        id: 'var-1',
        priceOverride: null,
        product: { id: 'prod-1', name: 'Rice', basePrice: 500, isActive: true, storeId: 'store-A' },
        inventory: { quantity: 5, reservedQuantity: 3 }, // available = 2
      });

      mockPrisma.cart.create.mockResolvedValue({
        id: 'cart-1',
        storeId: 'store-A',
      });
      mockPrisma.cartItem.findFirst.mockResolvedValue(null);

      await expect(
        service.addItem('cust-1', {
          storeId: 'store-A',
          productVariantId: 'var-1',
          quantity: 3, // exceeds available (2)
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
