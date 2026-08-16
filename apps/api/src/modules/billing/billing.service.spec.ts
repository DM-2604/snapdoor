import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../shared/database/prisma.service';
import { BillingService } from './billing.service';

const mockPrisma: any = {
  storeBilling: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  platformFeePlan: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  store: {
    findFirst: jest.fn(),
  },
  payoutAccount: {
    findFirst: jest.fn(),
  },
  invoice: {
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
  },
  settlement: {
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
  },
  order: {
    findMany: jest.fn(),
  },
};

describe('BillingService', () => {
  let service: BillingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    jest.clearAllMocks();
  });

  const mockBilling = {
    id: 'bill-1',
    storeId: 'store-1',
    gstRegistered: true,
    gstNumber: '29ABCDE1234F1Z5',
  };

  describe('getBillingProfile', () => {
    it('returns existing billing profile', async () => {
      mockPrisma.storeBilling.findFirst.mockResolvedValue(mockBilling);

      const res = await service.getBillingProfile('store-1');
      expect(res.gstNumber).toBe('29ABCDE1234F1Z5');
      expect(mockPrisma.storeBilling.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { storeId: 'store-1', deletedAt: null } }),
      );
    });

    it('creates default store billing record if not present', async () => {
      mockPrisma.storeBilling.findFirst.mockResolvedValue(null);
      mockPrisma.store.findFirst.mockResolvedValue({ id: 'store-1', cityId: 'city-1' });
      mockPrisma.platformFeePlan.findFirst.mockResolvedValue({ id: 'plan-1' });
      mockPrisma.storeBilling.create.mockResolvedValue({
        id: 'bill-created',
        storeId: 'store-1',
        platformFeePlanId: 'plan-1',
      });

      const res = await service.getBillingProfile('store-1');
      expect(res.id).toBe('bill-created');
      expect(mockPrisma.storeBilling.create).toHaveBeenCalled();
    });
  });

  describe('getFinancialSummary', () => {
    it('calculates monthly gross sales, commissions, channel breakdowns, and pending settlements', async () => {
      mockPrisma.order.findMany.mockResolvedValue([
        { totalAmount: 1000, commissionAmount: 50, channel: 'APP' },
        { totalAmount: 500, commissionAmount: 0, channel: 'POS' },
      ]);
      mockPrisma.settlement.findMany.mockResolvedValue([
        { netPayable: 950 },
      ]);

      const summary = await service.getFinancialSummary('store-1');

      expect(summary.currentMonthGrossSales).toBe(1500);
      expect(summary.currentMonthCommission).toBe(50);
      expect(summary.currentMonthAppSales).toBe(1000);
      expect(summary.currentMonthPosSales).toBe(500);
      expect(summary.currentMonthNetEarnings).toBe(1450);
      expect(summary.pendingPayoutBalance).toBe(950);
    });
  });
});
