import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Store, UserRole } from '@prisma/client';
import { CurrentStore } from '../../shared/decorators/current-store.decorator';
import { CurrentUser, JwtPayload } from '../../shared/decorators/current-user.decorator';
import { RequireLiveStore } from '../../shared/decorators/require-live-store.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { StoreOwnerGuard } from '../../shared/guards/store-owner.guard';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { InventoryService } from './inventory.service';

@ApiTags('store — inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, StoreOwnerGuard)
@Roles(UserRole.STORE_OWNER)
@RequireLiveStore()
@Controller('store/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'List inventory balances for store with optional low-stock filter' })
  @ApiQuery({ name: 'lowStockOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listStoreInventory(
    @CurrentStore() store: Store,
    @Query('lowStockOnly') lowStockOnly?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.getByStore(store.id, {
      lowStockOnly: lowStockOnly === 'true',
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Adjust variant stock quantity (Restock, Correction, Damage, etc.)' })
  adjustStock(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Body() dto: AdjustInventoryDto,
  ) {
    return this.inventoryService.adjustStock(
      store.id,
      dto.productVariantId,
      dto.changeQty,
      dto.reason,
      undefined,
      user.sub,
    );
  }

  @Get('variant/:productVariantId/history')
  @ApiOperation({ summary: 'Get stock adjustment history for a specific product variant' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getVariantHistory(
    @CurrentStore() store: Store,
    @Param('productVariantId') productVariantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.getAdjustmentHistory(
      store.id,
      productVariantId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
