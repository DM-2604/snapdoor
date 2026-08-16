import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { EventBusService } from '../../shared/events/event-bus.service';
import { OrderStatus } from '@prisma/client';
import { DomainEvents } from '../../shared/events/domain-events.const';

/**
 * RatingsService
 * Reviews, moderation queue — seq 9.8
 * Sequence diagrams: 9.8 (review submission + moderation)
 */
@Injectable()
export class RatingsService {
  private readonly logger = new Logger(RatingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  async replyToReview(reviewId: string, reply: string, actorUserId: string) {
    const review = await this.prisma.review.findFirst({ where: { id: reviewId }, include: { store: true } });
    if (!review) throw new NotFoundException('Review not found');

    if (review.store.ownerUserId !== actorUserId) {
      throw new UnauthorizedException('Only the store owner can reply to this review.');
    }

    return { reviewId, status: 'replied' };
  }

  async createReview(orderId: string, customerId: string, dto: { rating: number; reviewText?: string }) {
    const order = await this.prisma.order.findFirst({ 
      where: { id: orderId, customerId },
      include: { review: true }
    });
    
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException('Order must be COMPLETED to leave a review.');
    }

    if (order.review) {
      throw new ConflictException('This order has already been reviewed.');
    }

    const review = await this.prisma.review.create({
      data: {
        orderId: order.id,
        storeId: order.storeId,
        customerId: customerId,
        rating: dto.rating,
        reviewText: dto.reviewText,
      }
    });

    const agg = await this.prisma.review.aggregate({
      where: { storeId: order.storeId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    const ratingAvg = agg._avg?.rating ?? dto.rating;
    const ratingCount = typeof agg._count === 'number' ? agg._count : (agg._count?.rating ?? 1);

    this.eventBus.emit(DomainEvents.ORDER_REVIEWED, {
      reviewId: review.id,
      orderId: order.id,
      storeId: order.storeId,
      rating: review.rating,
    });

    return { 
      review,
      storeRating: {
        ratingAvg,
        ratingCount
      }
    };
  }
}
