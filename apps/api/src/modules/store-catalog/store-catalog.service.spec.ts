// store-catalog.service.spec.ts

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../shared/database/prisma.service';
import { AuditLogService } from '../admin-ops/audit-log.service';
import { STORE_NOTIFICATION_SERVICE } from '../admin-ops/store-notification.interface';
import { DocumentsService } from '../documents/documents.service';
import { CommissionResolverService } from '../platform-config/commission-resolver.service';
import { StoreCatalogService } from './store-catalog.service';

// Mock geo helper
jest.mock('../../shared/database/geo', () => ({
  getStoreLocation: jest.fn().mockResolvedValue({ lat: 23.0, lng: 72.5 }),
}));

const mockPrisma: any = {
  store: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  storeApprovalQueue: { create: jest.fn() },
  category: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

const mockCommissionResolver = { applyEffectiveRateToStore: jest.fn() };
const mockAuditLog = { record: jest.fn() };
const mockNotificationService = { notifyStoreApprovalDecision: jest.fn() };
const mockDocumentsService = {
  areRequiredDocumentsVerified: jest.fn().mockResolvedValue({ isVerified: true, unverifiedDocs: [] }),
};

describe('StoreCatalogService', () => {
  let service: StoreCatalogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreCatalogService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CommissionResolverService, useValue: mockCommissionResolver },
        { provide: AuditLogService, useValue: mockAuditLog },
        { provide: DocumentsService, useValue: mockDocumentsService },
        { provide: STORE_NOTIFICATION_SERVICE, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<StoreCatalogService>(StoreCatalogService);
    jest.clearAllMocks();
  });

  const mockStore = {
    id: 'store-1',
    status: 'PENDING',
    ownerUserId: 'user-1',
    cityId: 'city-1',
    zoneId: 'zone-1',
    businessCategoryId: 'cat-1',
    deletedAt: null,
  };

  describe('approveStore', () => {
    it('flips Store.status to LIVE and writes approval queue row', async () => {
      mockPrisma.store.findFirst.mockResolvedValue(mockStore);
      mockPrisma.store.update.mockResolvedValue({ ...mockStore, status: 'LIVE' });
      mockPrisma.storeApprovalQueue.create.mockResolvedValue({});
      mockCommissionResolver.applyEffectiveRateToStore.mockResolvedValue(6.0);
      mockAuditLog.record.mockResolvedValue(undefined);
      mockNotificationService.notifyStoreApprovalDecision.mockResolvedValue(undefined);
      mockDocumentsService.areRequiredDocumentsVerified.mockResolvedValue({
        isVerified: true,
        unverifiedDocs: [],
      });

      const result = await service.approveStore('store-1', 'admin-1');

      expect(mockPrisma.store.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'LIVE' }) }),
      );
      expect(mockPrisma.storeApprovalQueue.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ decision: 'APPROVED' }) }),
      );
      expect(mockAuditLog.record).toHaveBeenCalledWith('admin-1', 'STORE_APPROVED', 'Store', 'store-1', expect.any(Object), expect.any(Object));
      expect(result.status).toBe('LIVE');
    });
  });

  describe('requestChanges', () => {
    it('does NOT change Store.status — store stays PENDING', async () => {
      mockPrisma.store.findFirst.mockResolvedValue(mockStore);
      mockPrisma.storeApprovalQueue.create.mockResolvedValue({});
      mockAuditLog.record.mockResolvedValue(undefined);
      mockNotificationService.notifyStoreApprovalDecision.mockResolvedValue(undefined);

      const result = await service.requestChanges('store-1', { reason: 'Blurry AADHAAR photo' }, 'admin-1');

      // CRITICAL: Store.status must remain PENDING — NOT REJECTED
      expect(mockPrisma.store.update).not.toHaveBeenCalled();
      expect(result.status).toBe('PENDING');

      // Queue row is written with decision=REJECTED (non-terminal intent)
      expect(mockPrisma.storeApprovalQueue.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ decision: 'REJECTED', decisionReason: 'Blurry AADHAAR photo' }),
        }),
      );
    });
  });

  describe('rejectStore', () => {
    it('sets Store.status to REJECTED (terminal)', async () => {
      mockPrisma.store.findFirst.mockResolvedValue(mockStore);
      mockPrisma.store.update.mockResolvedValue({ ...mockStore, status: 'REJECTED' });
      mockPrisma.storeApprovalQueue.create.mockResolvedValue({});
      mockAuditLog.record.mockResolvedValue(undefined);
      mockNotificationService.notifyStoreApprovalDecision.mockResolvedValue(undefined);

      const result = await service.rejectStore('store-1', { reason: 'Fraudulent documents' }, 'admin-1');

      expect(mockPrisma.store.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'REJECTED' }) }),
      );
      expect(result.status).toBe('REJECTED');
    });
  });

  describe('getStore', () => {
    it('returns store with decoded lat/lng from geo helper', async () => {
      const storeWithIncludes = {
        ...mockStore,
        owner: { id: 'user-1', name: 'Test Owner', phoneNumber: '+91999', email: null },
        city: { id: 'city-1', name: 'Ahmedabad' },
        zone: null,
        businessCategory: { id: 'cat-1', name: 'Grocery' },
        billing: null,
        approvalQueue: [],
      };
      mockPrisma.store.findFirst.mockResolvedValue(storeWithIncludes);

      const result = await service.getStore('store-1');

      expect(result.location).toEqual({ lat: 23.0, lng: 72.5 });
    });

    it('throws NotFoundException for missing store', async () => {
      mockPrisma.store.findFirst.mockResolvedValue(null);
      await expect(service.getStore('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('requestChanges vs rejectStore distinction', () => {
    it('requestChanges does not call store.update; rejectStore does', async () => {
      mockPrisma.store.findFirst.mockResolvedValue(mockStore);
      mockPrisma.storeApprovalQueue.create.mockResolvedValue({});
      mockAuditLog.record.mockResolvedValue(undefined);
      mockNotificationService.notifyStoreApprovalDecision.mockResolvedValue(undefined);

      await service.requestChanges('store-1', { reason: 'Fix docs' }, 'admin-1');
      expect(mockPrisma.store.update).not.toHaveBeenCalled();

      jest.clearAllMocks();
      mockPrisma.store.findFirst.mockResolvedValue(mockStore);
      mockPrisma.store.update.mockResolvedValue({ ...mockStore, status: 'REJECTED' });
      mockPrisma.storeApprovalQueue.create.mockResolvedValue({});
      mockAuditLog.record.mockResolvedValue(undefined);
      mockNotificationService.notifyStoreApprovalDecision.mockResolvedValue(undefined);

      await service.rejectStore('store-1', { reason: 'Fraud' }, 'admin-1');
      expect(mockPrisma.store.update).toHaveBeenCalledTimes(1);
    });
  });
});
