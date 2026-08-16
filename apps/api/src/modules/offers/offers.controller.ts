// apps/api/src/modules/offers/offers.controller.ts
// Store-owner CRUD for Offers — authenticated via JwtAuthGuard + StoreOwnerGuard.
// The @CurrentStore() decorator injects the Store entity validated by StoreOwnerGuard.

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Store, UserRole } from '@prisma/client';
import { CurrentStore } from '../../shared/decorators/current-store.decorator';
import { RequireLiveStore } from '../../shared/decorators/require-live-store.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { StoreOwnerGuard } from '../../shared/guards/store-owner.guard';
import { CreateOfferDto } from './dto/create-offer.dto';
import { ListOffersDto } from './dto/list-offers.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OffersService } from './offers.service';

@ApiTags('store — offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, StoreOwnerGuard)
@Roles(UserRole.STORE_OWNER)
@RequireLiveStore()
@Controller('store/offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new offer for the store' })
  create(@CurrentStore() store: Store, @Body() dto: CreateOfferDto) {
    return this.offersService.createOffer(store.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all offers for the store with optional status filter' })
  list(@CurrentStore() store: Store, @Query() query: ListOffersDto) {
    return this.offersService.listOffers(store.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single offer by ID' })
  getOne(@CurrentStore() store: Store, @Param('id') id: string) {
    return this.offersService.getOfferById(store.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update offer fields' })
  update(
    @CurrentStore() store: Store,
    @Param('id') id: string,
    @Body() dto: UpdateOfferDto,
  ) {
    return this.offersService.updateOffer(store.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an offer (sets deletedAt + EXPIRED status)' })
  remove(@CurrentStore() store: Store, @Param('id') id: string) {
    return this.offersService.deleteOffer(store.id, id);
  }

  @Post(':id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate or pause an offer' })
  toggle(
    @CurrentStore() store: Store,
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.offersService.toggleOffer(store.id, id, isActive);
  }
}
