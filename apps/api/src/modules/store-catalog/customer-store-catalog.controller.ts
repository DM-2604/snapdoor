import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../shared/decorators/public.decorator';
import { CustomerStoreCatalogService } from './customer-store-catalog.service';

@ApiTags('customer — store discovery')
@Controller('customer')
export class CustomerStoreCatalogController {
  constructor(
    private readonly customerCatalogService: CustomerStoreCatalogService,
  ) {}

  @Get('stores/nearby')
  @Public()
  @ApiOperation({
    summary: 'Discover LIVE stores that can deliver to the user — filtered by each store\'s admin-set deliveryRadiusKm',
  })
  @ApiQuery({ name: 'lat', required: true, type: Number, example: 23.0225 })
  @ApiQuery({ name: 'lng', required: true, type: Number, example: 72.5714 })
  async findNearbyStores(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    return this.customerCatalogService.findNearbyStores(latNum, lngNum);
  }

  @Get('stores/:id')
  @Public()
  @ApiOperation({
    summary: 'Get store details including computed open/closed status and weekly operating hours',
  })
  async getStoreDetails(@Param('id') id: string) {
    return this.customerCatalogService.getStoreDetails(id);
  }

  @Get('stores/:id/menu')
  @Public()
  @ApiOperation({
    summary: 'Get store menu products and variants with 3-tier sale discount pricing applied',
  })
  async getStoreMenu(@Param('id') id: string) {
    return this.customerCatalogService.getStoreMenu(id);
  }

  @Get('categories')
  @Public()
  @ApiOperation({
    summary: 'Get public platform category hierarchy (root verticals and subcategories)',
  })
  async getCategories() {
    return this.customerCatalogService.getCategories();
  }
}
