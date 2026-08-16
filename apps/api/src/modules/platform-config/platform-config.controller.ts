// Implements v3 §3 — Platform Config Controller
// All routes require ADMIN role.

import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../shared/decorators/current-user.decorator';
import { PlatformConfigService } from './platform-config.service';
import { PrismaCommissionSearchService, ListCommissionRulesDto } from './commission-search.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { CreateCommissionRuleDto } from './dto/create-commission-rule.dto';
import { CreateFeePlanDto } from './dto/create-fee-plan.dto';
import { UpdateFeePlanDto } from './dto/update-fee-plan.dto';
import { SetSettingDto } from './dto/set-setting.dto';
import { Query } from '@nestjs/common';

@ApiTags('admin — platform config')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin')
export class PlatformConfigController {
  constructor(
    private readonly service: PlatformConfigService,
    private readonly searchService: PrismaCommissionSearchService
  ) {}

  // ── Cities ──────────────────────────────────────────────────────────────────

  @Post('geo/cities')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new city' })
  createCity(@Body() dto: CreateCityDto, @CurrentUser() user: JwtPayload) {
    return this.service.createCity(dto, user.sub);
  }

  @Get('geo/cities')
  @ApiOperation({ summary: 'List all active cities' })
  listCities() {
    return this.service.listCities();
  }

  @Patch('geo/cities/:id')
  @ApiOperation({ summary: 'Update a city (name, status, commission, fleet flag)' })
  updateCity(
    @Param('id') id: string,
    @Body() dto: UpdateCityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateCity(id, dto, user.sub);
  }

  // ── Zones ───────────────────────────────────────────────────────────────────

  @Post('geo/cities/:cityId/zones')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a delivery zone within a city (centroid is set via PostGIS)' })
  createZone(
    @Param('cityId') cityId: string,
    @Body() dto: CreateZoneDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.createZone(cityId, dto, user.sub);
  }

  @Get('geo/cities/:cityId/zones')
  @ApiOperation({ summary: 'List all zones for a city' })
  listZones(@Param('cityId') cityId: string) {
    return this.service.listZones(cityId);
  }

  @Patch('geo/zones/:id')
  @ApiOperation({ summary: 'Update a zone (name, code, commission, active status)' })
  updateZone(
    @Param('id') id: string,
    @Body() dto: UpdateZoneDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateZone(id, dto, user.sub);
  }

  // ── Commission Rules ─────────────────────────────────────────────────────────

  @Post('commission/rules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a commission rule — scope: global (all null) > city > zone > category > store',
  })
  createCommissionRule(
    @Body() dto: CreateCommissionRuleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.createCommissionRule(dto, user.sub);
  }

  @Get('commission/rules')
  @ApiOperation({ summary: 'List all commission rules' })
  listCommissionRules(@Query() dto: ListCommissionRulesDto) {
    return this.searchService.search(dto);
  }

  // ── Fee Plans ────────────────────────────────────────────────────────────────

  @Post('fee-plans')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new platform fee plan (flat monthly or percentage)' })
  createFeePlan(@Body() dto: CreateFeePlanDto, @CurrentUser() user: JwtPayload) {
    return this.service.createFeePlan(dto, user.sub);
  }

  @Get('fee-plans')
  @ApiOperation({ summary: 'List all fee plans' })
  listFeePlans() {
    return this.service.listFeePlans();
  }

  @Patch('fee-plans/:id')
  @ApiOperation({ summary: 'Update a fee plan (name, amounts, active status)' })
  updateFeePlan(
    @Param('id') id: string,
    @Body() dto: UpdateFeePlanDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateFeePlan(id, dto, user.sub);
  }

  // ── Platform Settings ────────────────────────────────────────────────────────

  @Get('settings/:key')
  @ApiOperation({ summary: 'Get a platform setting by key' })
  getSetting(@Param('key') key: string) {
    return this.service.getSetting(key);
  }

  @Put('settings/:key')
  @ApiOperation({ summary: 'Set / update a platform setting (JSON value column)' })
  setSetting(
    @Param('key') key: string,
    @Body() dto: SetSettingDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.setSetting(key, dto, user.sub);
  }
}
