// Implements v3 §4 — Store Catalog Controller
// All routes: @Roles('ADMIN')

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../shared/decorators/current-user.decorator';
import { StoreCatalogService } from './store-catalog.service';
import { ListStoresQueryDto } from './dto/list-stores-query.dto';
import { RejectStoreDto } from './dto/reject-store.dto';
import { RequestChangesDto } from './dto/request-changes.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { CreateStoreAdminDto } from './dto/create-store-admin.dto';
import { UpdateStoreAdminDto } from './dto/update-store-admin.dto';

@ApiTags('admin — stores & categories')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin')
export class StoreCatalogController {
  constructor(private readonly storeCatalogService: StoreCatalogService) {}

  // ── Stores ──────────────────────────────────────────────────────────────────

  @Post('stores')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin creates a store onboarding record for a merchant' })
  createStore(@Body() dto: CreateStoreAdminDto, @CurrentUser() user: JwtPayload) {
    return this.storeCatalogService.createStoreByAdmin(dto, user.sub);
  }

  @Get('stores')
  @ApiOperation({ summary: 'List stores with optional filters (status, city, zone, search)' })
  listStores(@Query() query: ListStoresQueryDto) {
    return this.storeCatalogService.listStores(query);
  }

  @Get('stores/:id')
  @ApiOperation({ summary: 'Get full store detail — owner contact, billing snapshot, approval history' })
  getStore(@Param('id') id: string) {
    return this.storeCatalogService.getStore(id);
  }

  @Patch('stores/:id')
  @ApiOperation({ summary: 'Admin updates basic store details (name, address, city, zone, coordinates)' })
  updateStore(
    @Param('id') id: string,
    @Body() dto: UpdateStoreAdminDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.storeCatalogService.updateStoreByAdmin(id, dto, user.sub);
  }

  @Post('stores/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve store — sets status LIVE, auto-calculates commission rate' })
  approve(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.storeCatalogService.approveStore(id, user.sub);
  }

  @Post('stores/:id/request-changes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request changes (non-terminal) — store status stays PENDING, owner can fix and resubmit',
  })
  requestChanges(
    @Param('id') id: string,
    @Body() dto: RequestChangesDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.storeCatalogService.requestChanges(id, dto, user.sub);
  }

  @Post('stores/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject store permanently (terminal) — sets status REJECTED, owner cannot resubmit',
  })
  reject(
    @Param('id') id: string,
    @Body() dto: RejectStoreDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.storeCatalogService.rejectStore(id, dto, user.sub);
  }

  // ── Categories (Addendum E — platform taxonomy) ──────────────────────────────
  // @Roles('ADMIN') is on the class, NOT on the service methods, so a future
  // store-owner-facing endpoint can call StoreCatalogService without a rewrite.

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a store vertical (parentCategoryId=null) or product sub-category' })
  createCategory(@Body() dto: CreateCategoryDto, @CurrentUser() user: JwtPayload) {
    return this.storeCatalogService.createCategory(dto, user.sub);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List full platform taxonomy tree (verticals + sub-categories, flat)' })
  listCategories() {
    return this.storeCatalogService.listCategories();
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a category — name, icon, sort order, active status, or parent' })
  updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.storeCatalogService.updateCategory(id, dto, user.sub);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a business vertical — blocked if any stores are still assigned to it' })
  deleteCategory(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.storeCatalogService.deleteCategory(id, user.sub);
  }
}
