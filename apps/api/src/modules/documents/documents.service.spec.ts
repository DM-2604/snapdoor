// documents.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  document: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

describe('DocumentsService', () => {
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    jest.clearAllMocks();
  });

  const mockDoc = {
    id: 'doc-1',
    ownerType: 'STORE' as const,
    ownerId: 'store-1',
    docType: 'GST_CERTIFICATE',
    verificationStatus: 'PENDING',
    deletedAt: null,
  };

  describe('listByOwner', () => {
    it('returns documents for a given owner', async () => {
      mockPrisma.document.findMany.mockResolvedValue([mockDoc]);
      const result = await service.listByOwner('STORE', 'store-1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ ownerType: 'STORE', ownerId: 'store-1' }) }),
      );
    });
  });

  describe('verifyDocument', () => {
    it('sets verificationStatus to VERIFIED', async () => {
      mockPrisma.document.findFirst.mockResolvedValue(mockDoc);
      mockPrisma.document.update.mockResolvedValue({ ...mockDoc, verificationStatus: 'VERIFIED' });

      const result = await service.verifyDocument('doc-1', 'admin-1');

      expect(mockPrisma.document.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ verificationStatus: 'VERIFIED', verifiedBy: 'admin-1' }) }),
      );
      expect(result.verificationStatus).toBe('VERIFIED');
    });

    it('throws NotFoundException for missing document', async () => {
      mockPrisma.document.findFirst.mockResolvedValue(null);
      await expect(service.verifyDocument('bad-id', 'admin-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('rejectDocument', () => {
    it('sets verificationStatus to REJECTED with reason', async () => {
      mockPrisma.document.findFirst.mockResolvedValue(mockDoc);
      mockPrisma.document.update.mockResolvedValue({ ...mockDoc, verificationStatus: 'REJECTED', rejectionReason: 'Blurry' });

      const result = await service.rejectDocument('doc-1', { reason: 'Blurry' }, 'admin-1');

      expect(mockPrisma.document.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ verificationStatus: 'REJECTED', rejectionReason: 'Blurry' }),
        }),
      );
    });

    it('does NOT touch Store.status — store model update is never called', async () => {
      // Ensure no store.update is ever called from within rejectDocument
      mockPrisma.document.findFirst.mockResolvedValue(mockDoc);
      mockPrisma.document.update.mockResolvedValue({ ...mockDoc, verificationStatus: 'REJECTED' });

      // If mockPrisma.store.update were called, the spy would throw (it's not defined)
      // This verifies the boundary is respected at the service level.
      await service.rejectDocument('doc-1', { reason: 'Test' }, 'admin-1');

      // Only document.update should be called — no store model involved
      expect(mockPrisma.document.update).toHaveBeenCalledTimes(1);
    });
  });
});
