import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { EventBusService } from '../../shared/events/event-bus.service';

const mockPrisma: any = {
  payment: {
    findFirst: jest.fn(),
  },
};

const mockEventBus: any = {
  emit: jest.fn(),
};

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    jest.clearAllMocks();
  });

  describe('getPayment', () => {
    it('returns payment if found and matches customer', async () => {
      const mockPayment = { id: 'pay-1', order: { customerId: 'cust-1' } };
      mockPrisma.payment.findFirst.mockResolvedValue(mockPayment);
      
      const result = await service.getPayment('pay-1', 'cust-1', UserRole.CUSTOMER);
      expect(result).toEqual(mockPayment);
    });

    it('throws NotFoundException if customer mismatch', async () => {
      const mockPayment = { id: 'pay-1', order: { customerId: 'cust-2' } };
      mockPrisma.payment.findFirst.mockResolvedValue(mockPayment);
      
      await expect(service.getPayment('pay-1', 'cust-1', UserRole.CUSTOMER)).rejects.toThrow(NotFoundException);
    });
  });

  describe('mockConfirm', () => {
    it('returns CONFIRMED if found and matches customer', async () => {
      const mockPayment = { id: 'pay-1', order: { customerId: 'cust-1' } };
      mockPrisma.payment.findFirst.mockResolvedValue(mockPayment);
      
      const result = await service.mockConfirm('pay-1', 'cust-1', UserRole.CUSTOMER);
      expect(result).toEqual({ status: 'CONFIRMED' });
    });
  });

  describe('initiateRefund', () => {
    it('returns REFUND_INITIATED if found and matches customer', async () => {
      const mockPayment = { id: 'pay-1', order: { customerId: 'cust-1' } };
      mockPrisma.payment.findFirst.mockResolvedValue(mockPayment);
      
      const result = await service.initiateRefund('pay-1', { reason: 'test' }, 'cust-1', UserRole.CUSTOMER);
      expect(result).toEqual({ status: 'REFUND_INITIATED', paymentId: 'pay-1' });
    });
  });
});
