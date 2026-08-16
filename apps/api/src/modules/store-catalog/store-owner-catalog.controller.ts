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
  Put,
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
import {
  CreateHourExceptionDto,
  CreateProductDto,
  CreateProductVariantDto,
  CreateStoreCategoryDto,
  GetAnalyticsDto,
  SubmitForReviewDto,
  TogglePauseDto,
  UpdateProductDto,
  UpdateProductVariantDto,
  UpdateStoreProfileDto,
  UpsertOperatingHoursDto,
} from './dto/store-owner-catalog.dto';
import { StoreOwnerCatalogService } from './store-owner-catalog.service';

@ApiTags('store — profile & catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, StoreOwnerGuard)
@Roles(UserRole.STORE_OWNER)
@Controller('store')
export class StoreOwnerCatalogController {
  constructor(private readonly service: StoreOwnerCatalogService) {}

  // ── Analytics ─────────────────────────────────────────────────────────────

  @Get('analytics')
  @ApiOperation({ summary: 'Store performance analytics — KPIs, revenue chart, categories, top customers' })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d'], description: 'Time window (default: 7d)' })
  getAnalytics(
    @CurrentStore() store: Store,
    @Query('period') period?: string,
  ) {
    const validPeriod = (['7d', '30d', '90d'] as const).includes(period as any)
      ? (period as '7d' | '30d' | '90d')
      : '7d';
    return this.service.getStoreAnalytics(store.id, validPeriod);
  }

  // ── Profile & Store Info ──────────────────────────────────────────────────

  @Get('profile')
  @ApiOperation({ summary: 'Get current merchant store profile, settings, and status' })
  getProfile(@CurrentStore() store: Store) {
    return this.service.getProfile(store.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update store description, address, photos, takeaway/delivery configs' })
  updateProfile(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateStoreProfileDto,
  ) {
    return this.service.updateProfile(store.id, dto, user.sub);
  }

  // ── Operating Hours & Exceptions ──────────────────────────────────────────

  @Get('operating-hours')
  @ApiOperation({ summary: 'Get weekly operating hours schedule and future date exceptions' })
  getOperatingHours(@CurrentStore() store: Store) {
    return this.service.getOperatingHours(store.id);
  }

  @Put('operating-hours')
  @ApiOperation({ summary: 'Set or update weekly operating hours schedule (days 0-6)' })
  upsertOperatingHours(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpsertOperatingHoursDto,
  ) {
    return this.service.upsertOperatingHours(store.id, dto, user.sub);
  }

  @Post('operating-hours/exceptions')
  @ApiOperation({ summary: 'Create special date operating hour exception (e.g. festive hours/holiday)' })
  createHourException(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateHourExceptionDto,
  ) {
    return this.service.createHourException(store.id, dto, user.sub);
  }

  @Delete('operating-hours/exceptions/:id')
  @ApiOperation({ summary: 'Remove a specific operating hour exception' })
  deleteHourException(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Param('id') exceptionId: string,
  ) {
    return this.service.deleteHourException(store.id, exceptionId, user.sub);
  }

  // ── Pause & Resume ────────────────────────────────────────────────────────

  @Post('toggle-pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause or resume receiving new orders' })
  togglePause(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Body() dto: TogglePauseDto,
  ) {
    return this.service.togglePause(store.id, dto, user.sub);
  }

  // ── Submit for Review (DRAFT -> PENDING) ───────────────────────────────────

  @Post('submit-for-review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit store for admin review (transitions DRAFT to PENDING; requires KYC docs & geo pin)' })
  submitForReview(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitForReviewDto,
  ) {
    return this.service.submitForReview(store.id, dto, user.sub);
  }

  // ── Product Categories (Store-owned, gated by LIVE store) ────────────────────

  @Get('categories')
  @ApiOperation({ summary: 'Get store business vertical and all store-owned product categories' })
  listMyCategories(@CurrentStore() store: Store) {
    return this.service.listCategoriesForStore(store.id, store.businessCategoryId);
  }

  @Post('categories')
  @RequireLiveStore()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a store-owned product category under the business vertical' })
  createCategory(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateStoreCategoryDto,
  ) {
    return this.service.createStoreCategory(store.id, store.businessCategoryId, dto, user.sub);
  }

  @Delete('categories/:id')
  @RequireLiveStore()
  @ApiOperation({ summary: 'Soft-delete a store-owned category (products reassigned to parent)' })
  deleteCategory(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Param('id') categoryId: string,
  ) {
    return this.service.deleteStoreCategory(store.id, categoryId, user.sub);
  }

  // ── Product Catalog (Gated: requires LIVE store) ──────────────────────────

  @Get('products')
  @RequireLiveStore()
  @ApiOperation({ summary: 'List all products for the store with variants and stock levels' })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listProducts(
    @CurrentStore() store: Store,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listProducts(store.id, {
      categoryId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Post('products')
  @RequireLiveStore()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product with default variant and inventory' })
  createProduct(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateProductDto,
  ) {
    return this.service.createProduct(store.id, dto, user.sub);
  }

  @Get('products/:id')
  @RequireLiveStore()
  @ApiOperation({ summary: 'Get single product details with all variants and stock levels' })
  getProduct(
    @CurrentStore() store: Store,
    @Param('id') productId: string,
  ) {
    return this.service.getProduct(store.id, productId);
  }

  @Patch('products/:id')
  @RequireLiveStore()
  @ApiOperation({ summary: 'Update product details' })
  updateProduct(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Param('id') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.updateProduct(store.id, productId, dto, user.sub);
  }

  @Delete('products/:id')
  @RequireLiveStore()
  @ApiOperation({ summary: 'Soft delete a product and its variants' })
  deleteProduct(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Param('id') productId: string,
  ) {
    return this.service.deleteProduct(store.id, productId, user.sub);
  }

  // ── Variant Endpoints (Gated: requires LIVE store) ─────────────────────────

  @Post('products/:id/variants')
  @RequireLiveStore()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new variant to an existing product' })
  createVariant(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Param('id') productId: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.service.createVariant(store.id, productId, dto, user.sub);
  }

  @Patch('products/:id/variants/:variantId')
  @RequireLiveStore()
  @ApiOperation({ summary: 'Update a product variant price, SKU, or active status' })
  updateVariant(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.service.updateVariant(store.id, productId, variantId, dto, user.sub);
  }

  @Delete('products/:id/variants/:variantId')
  @RequireLiveStore()
  @ApiOperation({ summary: 'Delete a product variant' })
  deleteVariant(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.service.deleteVariant(store.id, productId, variantId, user.sub);
  }
}
