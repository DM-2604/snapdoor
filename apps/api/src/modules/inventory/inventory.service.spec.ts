import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryAdjustmentReason } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { EventBusService } from '../../shared/events/event-bus.service';
import { InventoryService } from './inventory.service';

const mockPrisma: any = {
  inventory: {
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  inventoryAdjustment: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
  productVariant: {
    update: jest.fn(),
  },
  $transaction: jest.fn((callback: any) =>
    Array.isArray(callback) ? Promise.all(callback) : callback(mockPrisma),
  ),
  $queryRaw: jest.fn().mockResolvedValue([{}]),
};

const mockEventBus = {
  emit: jest.fn(),
  emitAsync: jest.fn(),
};

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    jest.clearAllMocks();
  });

  const mockInventory = {
    id: 'inv-1',
    productVariantId: 'var-1',
    quantity: 10,
    reservedQuantity: 0,
    lowStockThreshold: 3,
    autoDisableAtZero: true,
    productVariant: {
      id: 'var-1',
      variantName: '500g',
      product: { id: 'prod-1', storeId: 'store-1', name: 'Milk' },
    },
  };

  describe('adjustStock', () => {
    it('throws NotFoundException if variant inventory is not found', async () => {
      mockPrisma.inventory.findFirst.mockResolvedValue(null);

      await expect(
        service.adjustStock(
          'store-1',
          'nonexistent',
          5,
          InventoryAdjustmentReason.RESTOCK,
          undefined,
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if reducing stock exceeds available inventory', async () => {
      mockPrisma.inventory.findFirst.mockResolvedValue(mockInventory);

      await expect(
        service.adjustStock(
          'store-1',
          'var-1',
          -15,
          InventoryAdjustmentReason.CORRECTION,
          undefined,
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('successfully updates inventory and logs InventoryAdjustment', async () => {
      mockPrisma.inventory.findFirst.mockResolvedValue(mockInventory);
      mockPrisma.inventory.update.mockResolvedValue({
        ...mockInventory,
        quantity: 15,
      });

      const res = await service.adjustStock(
        'store-1',
        'var-1',
        5,
        InventoryAdjustmentReason.RESTOCK,
        undefined,
        'user-1',
      );

      expect(mockPrisma.inventory.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: expect.objectContaining({ quantity: 15 }),
        }),
      );
      expect(res.inventory.quantity).toBe(15);
    });
  });

  describe('reserveStock & releaseReservedStock', () => {
    it('reserves stock when sufficient inventory is available', async () => {
      mockPrisma.inventory.findFirst.mockResolvedValue(mockInventory);
      mockPrisma.inventory.update.mockResolvedValue({
        ...mockInventory,
        reservedQuantity: 2,
      });

      const res = await service.reserveStock('var-1', 2, 'user-1');
      expect(res.reservedQuantity).toBe(2);
      expect(mockPrisma.inventory.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: expect.objectContaining({ reservedQuantity: 2 }),
      });
    });

    it('throws BadRequestException when reservation exceeds available quantity', async () => {
      mockPrisma.inventory.findFirst.mockResolvedValue({
        ...mockInventory,
        quantity: 5,
        reservedQuantity: 4,
      });

      await expect(service.reserveStock('var-1', 2, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('releases reserved stock properly', async () => {
      mockPrisma.inventory.findFirst.mockResolvedValue({
        ...mockInventory,
        reservedQuantity: 3,
      });
      mockPrisma.inventory.update.mockResolvedValue({
        ...mockInventory,
        reservedQuantity: 1,
      });

      const res = await service.releaseReservedStock('var-1', 2, 'user-1');
      expect(res?.reservedQuantity).toBe(1);
    });
  });

  describe('decrementDirectStock (POS walk-in sales)', () => {
    it('decrements stock and auto-disables variant if stock hits zero and autoDisableAtZero is true', async () => {
      mockPrisma.inventory.findFirst.mockResolvedValue({
        ...mockInventory,
        quantity: 2,
        autoDisableAtZero: true,
      });
      mockPrisma.inventory.update.mockResolvedValue({
        ...mockInventory,
        quantity: 0,
      });

      await service.decrementDirectStock('store-1', 'var-1', 2, 'order-pos-1', 'user-1');

      expect(mockPrisma.inventory.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: expect.objectContaining({ quantity: 0 }),
        }),
      );
      expect(mockPrisma.productVariant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'var-1' },
          data: expect.objectContaining({ isActive: false }),
        }),
      );
    });
  });
});
