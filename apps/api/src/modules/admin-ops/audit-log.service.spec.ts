// apps/api/src/modules/admin-ops/audit-log.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../../shared/database/prisma.service';

const mockPrisma = {
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

describe('AuditLogService', () => {
  let service: AuditLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
    jest.clearAllMocks();
  });

  describe('record()', () => {
    it('creates an audit log entry with all fields', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({});

      await service.record(
        'admin-user-id',
        'STORE_APPROVED',
        'Store',
        'store-id-123',
        { status: 'PENDING' },
        { status: 'LIVE' },
      );

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          actorUserId: 'admin-user-id',
          action: 'STORE_APPROVED',
          entityType: 'Store',
          entityId: 'store-id-123',
          before: { status: 'PENDING' },
          after: { status: 'LIVE' },
        },
      });
    });

    it('accepts null actorUserId (system actions)', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({});

      await service.record(null, 'SYSTEM_SEED', 'Store', 'store-id-123');

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ actorUserId: undefined }),
        }),
      );
    });

    it('omits before/after when not provided', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({});

      await service.record('admin-id', 'SETTING_UPDATED', 'PlatformSetting', 'setting-id');

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          actorUserId: 'admin-id',
          action: 'SETTING_UPDATED',
          entityType: 'PlatformSetting',
          entityId: 'setting-id',
          before: undefined,
          after: undefined,
        },
      });
    });
  });

  describe('list()', () => {
    const mockLogs = [
      {
        id: 'log-1',
        actorUserId: 'admin-id',
        action: 'STORE_APPROVED',
        entityType: 'Store',
        entityId: 'store-id',
        before: null,
        after: { status: 'LIVE' },
        createdAt: new Date('2026-01-01'),
        actor: { id: 'admin-id', name: 'Admin User', phoneNumber: '+910000000000' },
      },
    ];

    it('returns paginated results with correct defaults', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);
      mockPrisma.auditLog.count.mockResolvedValue(1);

      const result = await service.list({});

      expect(result).toEqual({ items: mockLogs, total: 1, page: 1, limit: 20 });
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20, orderBy: { createdAt: 'desc' } }),
      );
    });

    it('applies entityType filter', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);
      mockPrisma.auditLog.count.mockResolvedValue(1);

      await service.list({ entityType: 'Store' });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ entityType: 'Store' }),
        }),
      );
    });

    it('applies entityId filter', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      await service.list({ entityId: 'store-id-xyz', page: 2, limit: 10 });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page 2 - 1) * limit 10
          take: 10,
          where: expect.objectContaining({ entityId: 'store-id-xyz' }),
        }),
      );
    });

    it('applies actorUserId filter', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      await service.list({ actorUserId: 'admin-id' });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ actorUserId: 'admin-id' }),
        }),
      );
    });

    it('runs count and findMany concurrently', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      await service.list({});

      // Both must be called exactly once
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.auditLog.count).toHaveBeenCalledTimes(1);
    });
  });
});
