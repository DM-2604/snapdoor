// platform-config.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { PlatformConfigService } from './platform-config.service';
import { CommissionResolverService } from './commission-resolver.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

// Mock the geo helper so tests don't need a real DB
jest.mock('../../shared/database/geo', () => ({
  setZoneCentroid: jest.fn().mockResolvedValue(undefined),
}));

const mockPrisma = {
  city: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  zone: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  commissionRule: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  platformFeePlan: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  platformSetting: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
};

describe('PlatformConfigService', () => {
  let service: PlatformConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformConfigService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CommissionResolverService, useValue: { applyEffectiveRateToStore: jest.fn() } },
      ],
    }).compile();

    service = module.get<PlatformConfigService>(PlatformConfigService);
    jest.clearAllMocks();
  });

  describe('createCity', () => {
    it('creates a city with defaults', async () => {
      const created = { id: 'city-1', name: 'Ahmedabad', state: 'Gujarat', country: 'India' };
      mockPrisma.city.create.mockResolvedValue(created);

      const result = await service.createCity({ name: 'Ahmedabad', state: 'Gujarat' }, 'admin-1');

      expect(mockPrisma.city.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ name: 'Ahmedabad', country: 'India' }) }),
      );
      expect(result).toEqual(created);
    });
  });

  describe('createZone', () => {
    it('throws if city not found', async () => {
      mockPrisma.city.findFirst.mockResolvedValue(null);
      await expect(
        service.createZone('bad-city-id', { name: 'West', code: 'AMD-W', lat: 23.0, lng: 72.5 }, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates zone and calls setZoneCentroid', async () => {
      const { setZoneCentroid } = require('../../shared/database/geo');
      mockPrisma.city.findFirst.mockResolvedValue({ id: 'city-1' });
      const createdZone = { id: 'zone-1', name: 'West', cityId: 'city-1' };
      mockPrisma.zone.create.mockResolvedValue(createdZone);

      const result = await service.createZone('city-1', { name: 'West', code: 'AMD-W', lat: 23.0, lng: 72.5 }, 'admin-1');

      expect(mockPrisma.zone.create).toHaveBeenCalled();
      expect(setZoneCentroid).toHaveBeenCalledWith(expect.anything(), 'zone-1', 23.0, 72.5);
      expect(result).toEqual(createdZone);
    });
  });

  describe('createCommissionRule', () => {
    it('creates an append-only rule', async () => {
      const rule = { id: 'rule-1', commissionPercent: 10 };
      mockPrisma.commissionRule.create.mockResolvedValue(rule);

      const result = await service.createCommissionRule({
        commissionPercent: 10,
        effectiveFrom: '2026-01-01',
      }, 'admin-1');

      expect(result).toEqual(rule);
    });
  });

  describe('listCommissionRules', () => {
    it('requests nested scope names (including store) and handles nulls', async () => {
      const mockRules = [
        { id: '1', cityId: 'c1', city: { id: 'c1', name: 'City' }, storeId: null, store: null },
        { id: '2', storeId: 's1', store: { id: 's1', name: 'Demo Grocery Store' }, cityId: null, city: null, zoneId: null, zone: null, categoryId: null, category: null },
        { id: '3', cityId: null, city: null, zoneId: null, zone: null, categoryId: null, category: null, storeId: null, store: null }, // global tier 5
      ];
      mockPrisma.commissionRule.findMany.mockResolvedValue(mockRules);

      const result = await service.listCommissionRules();

      expect(mockPrisma.commissionRule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            city: { select: { id: true, name: true } },
            zone: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
            store: { select: { id: true, name: true } },
          }
        })
      );
      // store-scoped rule resolves to store name, not a truncated ID
      expect(result[1].store).toEqual({ id: 's1', name: 'Demo Grocery Store' });
      // non-store-scoped rules have store: null
      expect(result[0].store).toBeNull();
      expect(result[2].store).toBeNull();
      expect(result).toEqual(mockRules);
    });
  });

  describe('listFeePlans', () => {
    it('requests nested city names', async () => {
      const mockPlans = [
        { id: '1', cityId: 'c1', city: { id: 'c1', name: 'City' } },
        { id: '2', cityId: null, city: null } // global plan
      ];
      mockPrisma.platformFeePlan.findMany.mockResolvedValue(mockPlans);

      const result = await service.listFeePlans();

      expect(mockPrisma.platformFeePlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            city: { select: { id: true, name: true } },
          }
        })
      );
      expect(result).toEqual(mockPlans);
    });
  });

  describe('getSetting', () => {
    it('throws if key not found', async () => {
      mockPrisma.platformSetting.findUnique.mockResolvedValue(null);
      await expect(service.getSetting('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('returns the setting', async () => {
      const setting = { id: 's-1', key: 'test', value: 42 };
      mockPrisma.platformSetting.findUnique.mockResolvedValue(setting);
      const result = await service.getSetting('test');
      expect(result).toEqual(setting);
    });
  });
});
