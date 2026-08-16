import { Controller, Get, Post, Body, Param, UseGuards, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';

/**
 * RatingsController
 * Sequence diagrams: 9.8 (review submission + moderation)
 */
@ApiTags('ratings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Public()
  @Get('store/:storeId/reviews')
  @ApiOperation({ summary: 'List published reviews for a store (Public)' })
  getStoreReviews(@Param('storeId') storeId: string) {
    // Stub for public review read
    return { storeId, reviews: [] };
  }

  @Post(':reviewId/reply')
  @ApiOperation({ summary: 'Store owner replies to a review' })
  async replyToReview(
    @Param('reviewId') reviewId: string,
    @Body() dto: { reply: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ratingsService.replyToReview(reviewId, dto.reply, user.sub);
  }

  // Stub health route for build verification
  @Get('health')
  @ApiOperation({ summary: 'Ratings module health check' })
  health() {
    return { module: 'ratings', status: 'ok' };
  }
}
