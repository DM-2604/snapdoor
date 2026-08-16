import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StoreStatus } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { AuditLogService } from '../admin-ops/audit-log.service';
import { DocumentsService } from '../documents/documents.service';
import { InventoryService } from '../inventory/inventory.service';
import { StoreOwnerCatalogService } from './store-owner-catalog.service';

const mockPrisma: any = {
  store: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  storeOperatingHour: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  storeHourException: {
    findMany: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  productVariant: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  category: {
    findFirst: jest.fn(),
  },
  storeApprovalQueue: {
    create: jest.fn(),
  },
  $queryRaw: jest.fn().mockResolvedValue([{ st_x: 77.5946, st_y: 12.9716 }]),
  $executeRaw: jest.fn().mockResolvedValue(1),
  $transaction: jest.fn((callback: any) =>
    Array.isArray(callback) ? Promise.all(callback) : callback(mockPrisma),
  ),
};

const mockAuditLog = {
  record: jest.fn(),
};

const mockDocumentsService = {
  getKycStatus: jest.fn(),
};

const mockInventoryService = {
  initInventory: jest.fn(),
};

describe('StoreOwnerCatalogService', () => {
  let service: StoreOwnerCatalogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreOwnerCatalogService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLogService, useValue: mockAuditLog },
        { provide: DocumentsService, useValue: mockDocumentsService },
        { provide: InventoryService, useValue: mockInventoryService },
      ],
    }).compile();

    service = module.get<StoreOwnerCatalogService>(StoreOwnerCatalogService);
    jest.clearAllMocks();
  });

  const mockStore = {
    id: 'store-123',
    name: 'Kirana Store',
    status: StoreStatus.DRAFT,
    businessCategoryId: 'cat-123',
    cityId: 'city-123',
    ownerUserId: 'user-123',
  };

  describe('submitForReview', () => {
    it('throws BadRequestException if store is in LIVE status', async () => {
      mockPrisma.store.findFirst.mockResolvedValue({ ...mockStore, status: StoreStatus.LIVE });

      await expect(
        service.submitForReview('store-123', {}, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if KYC is incomplete', async () => {
      mockPrisma.store.findFirst.mockResolvedValue(mockStore);
      mockDocumentsService.getKycStatus.mockResolvedValue({
        allRequiredUploaded: false,
        missingRequiredDocs: ['GSTIN_CERTIFICATE'],
      });

      await expect(
        service.submitForReview('store-123', {}, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('transitions DRAFT store to PENDING upon successful review submission', async () => {
      mockPrisma.store.findFirst.mockResolvedValue(mockStore);
      mockDocumentsService.getKycStatus.mockResolvedValue({
        allRequiredUploaded: true,
        missingRequiredDocs: [],
      });
      mockPrisma.store.update.mockResolvedValue({ ...mockStore, status: StoreStatus.PENDING });
      mockPrisma.storeApprovalQueue.create.mockResolvedValue({});

      const res = await service.submitForReview('store-123', { latitude: 12.97, longitude: 77.59 }, 'user-123');
      expect(res.status).toBe(StoreStatus.PENDING);
      expect(mockPrisma.store.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'store-123' },
          data: expect.objectContaining({ status: StoreStatus.PENDING }),
        }),
      );
    });
  });

  describe('createProduct', () => {
    it('creates product, variant, and initializes inventory', async () => {
      mockPrisma.store.findFirst.mockResolvedValue(mockStore);

      const createdProd = {
        id: 'prod-1',
        name: 'Wheat Atta',
        categoryId: 'cat-123',
        basePrice: 280,
      };
      mockPrisma.product.create.mockResolvedValue(createdProd);
      mockPrisma.productVariant.create.mockResolvedValue({
        id: 'var-1',
        productId: 'prod-1',
        variantName: '5kg',
        sku: 'ATT-5KG',
      });
      mockInventoryService.initInventory.mockResolvedValue({
        id: 'inv-1',
        productVariantId: 'var-1',
        quantity: 10,
      });

      const result = await service.createProduct(
        'store-123',
        {
          name: 'Wheat Atta',
          variantName: '5kg',
          sku: 'ATT-5KG',
          mrp: 300,
          sellingPrice: 280,
          initialStockQuantity: 10,
        },
        'user-123',
      );

      expect(mockPrisma.product.create).toHaveBeenCalled();
      expect(mockInventoryService.initInventory).toHaveBeenCalledWith(
        'var-1',
        10,
        5,
        true,
        'user-123',
        expect.anything(),
      );
      expect(result.id).toBe('prod-1');
    });
  });
});
