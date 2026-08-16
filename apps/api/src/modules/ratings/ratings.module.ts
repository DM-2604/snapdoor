import { Module } from '@nestjs/common';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

/**
 * RatingsModule — bounded context
 * Reviews, moderation queue — seq 9.8
 * Sequence diagrams: 9.8 (review submission + moderation)
 */
@Module({
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
