import { Test, TestingModule } from '@nestjs/testing';
import { DiscountType, StoreStatus } from '@prisma/client';
import { CustomerStoreCatalogService } from './customer-store-catalog.service';
import { PrismaService } from '../../shared/database/prisma.service';

jest.mock('../../shared/database/geo', () => ({
  findStoresDeliverableTo: jest.fn(),
}));

import { findStoresDeliverableTo } from '../../shared/database/geo';

const mockPrisma: any = {
  store: {
    findFirst: jest.fn(),
  },
  sale: {
    findMany: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
  },
  storeOperatingHour: {
    findMany: jest.fn(),
  },
  storeHourException: {
    findMany: jest.fn(),
  },
};

describe('CustomerStoreCatalogService', () => {
  let service: CustomerStoreCatalogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerStoreCatalogService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CustomerStoreCatalogService>(CustomerStoreCatalogService);
    jest.clearAllMocks();
  });

  describe('findNearbyStores', () => {
    it('returns nearby stores enriched with distanceKm and avgPrepTimeMinutes', async () => {
      (findStoresDeliverableTo as jest.Mock).mockResolvedValue([
        {
          id: 'store-1',
          name: 'Ahmedabad Supermart',
          storeCode: 'STORE-001',
          description: 'Fresh groceries daily',
          businessCategoryId: 'cat-1',
          address: 'SG Highway',
          status: 'LIVE',
          isTemporarilyPaused: false,
          photos: [],
          takeawayEnabled: true,
          deliveryEnabled: true,
          deliveryRadiusKm: 5,
          deliveryFee: 25,
          avgPrepTimeMinutes: 20,
          cityId: 'city-1',
          zoneId: 'zone-1',
          distanceMeters: 1540,
          lat: 23.0225,
          lng: 72.5714,
        },
      ]);

      mockPrisma.storeOperatingHour.findMany.mockResolvedValue([
        { dayOfWeek: new Date().getDay(), openTime: '00:00', closeTime: '23:59', isClosed: false },
      ]);
      mockPrisma.storeHourException.findMany.mockResolvedValue([]);

      const result = await service.findNearbyStores(23.0225, 72.5714);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('store-1');
      expect(result[0].distanceKm).toBe(1.5);
      expect(result[0].avgPrepTimeMinutes).toBe(20);
      expect(result[0].isOpen).toBe(true);
    });
  });

  describe('getStoreMenu', () => {
    it('resolves 3-tier sale discounts and surfaces effectiveSalePrice', async () => {
      mockPrisma.store.findFirst.mockResolvedValue({
        id: 'store-1',
        name: 'Ahmedabad Supermart',
        businessCategoryId: 'cat-groceries',
        avgPrepTimeMinutes: 15,
      });

      // Product 1 has a product-specific 20% sale
      // Product 2 has a store-level ₹50 flat sale
      mockPrisma.sale.findMany.mockResolvedValue([
        {
          id: 'sale-prod-1',
          productId: 'prod-1',
          storeId: null,
          categoryId: null,
          discountType: DiscountType.PERCENT,
          discountValue: 20,
          maxDiscountAmount: 50,
          createdAt: new Date(),
        },
        {
          id: 'sale-store-1',
          productId: null,
          storeId: 'store-1',
          categoryId: null,
          discountType: DiscountType.FLAT_AMOUNT,
          discountValue: 50,
          createdAt: new Date(),
        },
      ]);

      mockPrisma.product.findMany.mockResolvedValue([
        {
          id: 'prod-1',
          name: 'Basmati Rice 5kg',
          basePrice: 500,
          categoryId: 'cat-groceries',
          category: { id: 'cat-groceries', name: 'Groceries' },
          variants: [
            {
              id: 'var-1',
              variantName: '5kg pack',
              priceOverride: null,
              inventory: { quantity: 10, reservedQuantity: 2 },
            },
          ],
        },
        {
          id: 'prod-2',
          name: 'Olive Oil 1L',
          basePrice: 300,
          categoryId: 'cat-groceries',
          category: { id: 'cat-groceries', name: 'Groceries' },
          variants: [
            {
              id: 'var-2',
              variantName: '1L bottle',
              priceOverride: null,
              inventory: { quantity: 5, reservedQuantity: 0 },
            },
          ],
        },
      ]);

      const result = await service.getStoreMenu('store-1');

      expect(result.avgPrepTimeMinutes).toBe(15);
      expect(result.items).toHaveLength(2);

      // Product 1: 500 - (500 * 0.20 = 100 clamped to max 50) = 450
      expect(result.items[0].effectiveSalePrice).toBe(450);
      expect(result.items[0].variants[0].availableStock).toBe(8);

      // Product 2: 300 - 50 = 250
      expect(result.items[1].effectiveSalePrice).toBe(250);
      expect(result.items[1].variants[0].availableStock).toBe(5);
    });
  });
});
