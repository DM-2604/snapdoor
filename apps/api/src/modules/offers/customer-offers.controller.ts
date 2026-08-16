// apps/api/src/modules/offers/customer-offers.controller.ts
// Public customer endpoint — lists only ACTIVE, non-deleted offers for a given store.
// Uses @Public() to bypass JWT guard (same pattern as store-catalog public endpoints).

import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../shared/decorators/public.decorator';
import { OffersService } from './offers.service';
import { OfferStatus } from '@prisma/client';

@ApiTags('customer — offers')
@Controller('customer/stores')
export class CustomerOffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get(':storeId/offers')
  @Public()
  @ApiOperation({ summary: 'List active offers for a store (public, no auth required)' })
  listActive(@Param('storeId') storeId: string) {
    return this.offersService.listOffers(storeId, { status: OfferStatus.ACTIVE });
  }
}
