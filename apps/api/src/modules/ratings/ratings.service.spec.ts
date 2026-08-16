import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { RatingsService } from './ratings.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { DomainEvents } from '../../shared/events/domain-events.const';
import { EventBusService } from '../../shared/events/event-bus.service';

const mockPrisma: any = {
  order: {
    findFirst: jest.fn(),
  },
  review: {
    create: jest.fn(),
    aggregate: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

const mockEventBus: any = {
  emit: jest.fn(),
};

describe('RatingsService', () => {
  let service: RatingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    it('creates review and recalculates aggregate rating for COMPLETED orders', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'ord-1',
        storeId: 'store-1',
        customerId: 'cust-1',
        status: OrderStatus.COMPLETED,
        review: null,
      });

      mockPrisma.review.create.mockResolvedValue({
        id: 'rev-1',
        orderId: 'ord-1',
        storeId: 'store-1',
        customerId: 'cust-1',
        rating: 5,
        reviewText: 'Great quality!',
      });

      mockPrisma.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.8 },
        _count: { rating: 12 },
      });

      const result = await service.createReview('ord-1', 'cust-1', {
        rating: 5,
        reviewText: 'Great quality!',
      });

      expect(result.review.id).toBe('rev-1');
      expect(result.storeRating.ratingAvg).toBe(4.8);
      expect(result.storeRating.ratingCount).toBe(12);
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        DomainEvents.ORDER_REVIEWED,
        expect.objectContaining({
          reviewId: 'rev-1',
          orderId: 'ord-1',
          storeId: 'store-1',
          rating: 5,
        }),
      );
    });

    it('rejects review if order is not in COMPLETED status', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'ord-2',
        storeId: 'store-1',
        customerId: 'cust-1',
        status: OrderStatus.ACCEPTED,
        review: null,
      });

      await expect(
        service.createReview('ord-2', 'cust-1', { rating: 4 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects review if order is already reviewed', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'ord-3',
        storeId: 'store-1',
        customerId: 'cust-1',
        status: OrderStatus.COMPLETED,
        review: { id: 'existing-rev' },
      });

      await expect(
        service.createReview('ord-3', 'cust-1', { rating: 4 }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
