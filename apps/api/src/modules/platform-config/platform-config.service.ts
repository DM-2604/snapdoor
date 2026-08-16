// Implements v3 §3 — Platform Config Service
//
// Owns CRUD for: City, Zone, CommissionRule (append-only), PlatformFeePlan, PlatformSetting.
// Commission resolution is delegated to CommissionResolverService.
//
// Zone centroid is written via geo.ts raw SQL helper immediately after zone.create().
// Zone polygon boundary drawing is OUT OF SCOPE for Phase 1 — see DECISIONS.md §3.

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { setZoneCentroid } from '../../shared/database/geo';
import { CommissionResolverService } from './commission-resolver.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { CreateCommissionRuleDto } from './dto/create-commission-rule.dto';
import { CreateFeePlanDto } from './dto/create-fee-plan.dto';
import { UpdateFeePlanDto } from './dto/update-fee-plan.dto';
import { SetSettingDto } from './dto/set-setting.dto';
import { City, Zone, CommissionRule, PlatformFeePlan, PlatformSetting, Prisma } from '@prisma/client';

// Precise return type for listCommissionRules() — carries all four scope relations.
// Using GetPayload instead of a manual interface keeps this in sync with the schema automatically.
type CommissionRuleWithScope = Prisma.CommissionRuleGetPayload<{
  include: {
    city: { select: { id: true; name: true } };
    zone: { select: { id: true; name: true } };
    category: { select: { id: true; name: true } };
    store: { select: { id: true; name: true } };
  };
}>;

@Injectable()
export class PlatformConfigService {
  constructor(
    private readonly prisma: PrismaService,
    readonly commissionResolver: CommissionResolverService,
  ) {}

  // ── Cities ──────────────────────────────────────────────────────────────────

  async createCity(dto: CreateCityDto, actorUserId?: string): Promise<City> {
    return this.prisma.city.create({
      data: {
        name: dto.name,
        state: dto.state,
        country: dto.country ?? 'India',
        timezone: dto.timezone ?? 'Asia/Kolkata',
        status: dto.status,
        launchDate: dto.launchDate ? new Date(dto.launchDate) : undefined,
        defaultCommissionPercent: dto.defaultCommissionPercent,
        isDeliveryFleetEnabled: dto.isDeliveryFleetEnabled ?? false,
        createdBy: actorUserId,
      },
    });
  }

  async listCities(): Promise<City[]> {
    return this.prisma.city.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async updateCity(id: string, dto: UpdateCityDto, actorUserId?: string): Promise<City> {
    await this.findCityOrThrow(id);
    return this.prisma.city.update({
      where: { id },
      data: {
        ...dto,
        launchDate: dto.launchDate ? new Date(dto.launchDate) : undefined,
        updatedBy: actorUserId,
      },
    });
  }

  // ── Zones ───────────────────────────────────────────────────────────────────

  async createZone(cityId: string, dto: CreateZoneDto, actorUserId?: string): Promise<Zone> {
    await this.findCityOrThrow(cityId);

    // Step 1: create the zone row (geometry column is written in step 2)
    const zone = await this.prisma.zone.create({
      data: {
        cityId,
        name: dto.name,
        code: dto.code,
        colorHex: dto.colorHex,
        isActive: dto.isActive ?? true,
        defaultCommissionPercent: dto.defaultCommissionPercent,
        createdBy: actorUserId,
      },
    });

    // Step 2 (REQUIRED): set the centroid via raw SQL — see geo.ts for why
    await setZoneCentroid(this.prisma as any, zone.id, dto.lat, dto.lng);

    return zone;
  }

  async listZones(cityId: string): Promise<Zone[]> {
    await this.findCityOrThrow(cityId);
    return this.prisma.zone.findMany({
      where: { cityId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async updateZone(id: string, dto: UpdateZoneDto, actorUserId?: string): Promise<Zone> {
    const zone = await this.prisma.zone.findFirst({ where: { id, deletedAt: null } });
    if (!zone) throw new NotFoundException(`Zone ${id} not found`);

    if ((dto.lat !== undefined && dto.lng !== undefined) ||
        (dto.lat !== undefined || dto.lng !== undefined)) {
      // Both must be provided together for a centroid update
      const lat = dto.lat ?? undefined;
      const lng = dto.lng ?? undefined;
      if (lat !== undefined && lng !== undefined) {
        await setZoneCentroid(this.prisma as any, id, lat, lng);
      }
    }

    return this.prisma.zone.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        colorHex: dto.colorHex,
        isActive: dto.isActive,
        defaultCommissionPercent: dto.defaultCommissionPercent,
        updatedBy: actorUserId,
      },
    });
  }

  // ── Commission Rules ─────────────────────────────────────────────────────────

  async createCommissionRule(
    dto: CreateCommissionRuleDto,
    actorUserId?: string,
  ): Promise<CommissionRule> {
    return this.prisma.commissionRule.create({
      data: {
        cityId: dto.cityId,
        zoneId: dto.zoneId,
        categoryId: dto.categoryId,
        storeId: dto.storeId,
        commissionPercent: dto.commissionPercent,
        effectiveFrom: new Date(dto.effectiveFrom),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
        reason: dto.reason,
        createdBy: actorUserId,
      },
    });
  }

  async listCommissionRules(): Promise<CommissionRuleWithScope[]> {
    return this.prisma.commissionRule.findMany({
      where: { deletedAt: null },
      include: {
        city: { select: { id: true, name: true } },
        zone: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        store: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Fee Plans ────────────────────────────────────────────────────────────────

  async createFeePlan(dto: CreateFeePlanDto, actorUserId?: string): Promise<PlatformFeePlan> {
    return this.prisma.platformFeePlan.create({
      data: {
        cityId: dto.cityId,
        name: dto.name,
        planType: dto.planType,
        monthlyFee: dto.monthlyFee,
        setupFee: dto.setupFee,
        billingFrequency: dto.billingFrequency ?? 'MONTHLY',
        isActive: dto.isActive ?? true,
        effectiveFrom: new Date(dto.effectiveFrom),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
        createdBy: actorUserId,
      },
    });
  }

  async listFeePlans(): Promise<PlatformFeePlan[]> {
    return this.prisma.platformFeePlan.findMany({
      where: { deletedAt: null },
      include: {
        city: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateFeePlan(
    id: string,
    dto: UpdateFeePlanDto,
    actorUserId?: string,
  ): Promise<PlatformFeePlan> {
    const plan = await this.prisma.platformFeePlan.findFirst({ where: { id, deletedAt: null } });
    if (!plan) throw new NotFoundException(`PlatformFeePlan ${id} not found`);

    return this.prisma.platformFeePlan.update({
      where: { id },
      data: {
        name: dto.name,
        planType: dto.planType,
        monthlyFee: dto.monthlyFee,
        setupFee: dto.setupFee,
        billingFrequency: dto.billingFrequency,
        isActive: dto.isActive,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
        updatedBy: actorUserId,
      },
    });
  }

  // ── Platform Settings ────────────────────────────────────────────────────────

  async getSetting(key: string): Promise<PlatformSetting> {
    const setting = await this.prisma.platformSetting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting '${key}' not found`);
    return setting;
  }

  async setSetting(key: string, dto: SetSettingDto, actorUserId?: string): Promise<PlatformSetting> {
    return this.prisma.platformSetting.upsert({
      where: { key },
      create: {
        key,
        value: dto.value as any,
        description: dto.description,
        createdBy: actorUserId,
      },
      update: {
        value: dto.value as any,
        description: dto.description,
        updatedBy: actorUserId,
      },
    });
  }

  // ── Dashboard helpers ────────────────────────────────────────────────────────

  async countActiveFeePlans(): Promise<number> {
    return this.prisma.platformFeePlan.count({ where: { isActive: true, deletedAt: null } });
  }

  async listZonesPerCity(): Promise<{ cityId: string; cityName: string; zoneCount: number }[]> {
    const cities = await this.prisma.city.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { zones: true } } },
    });
    return cities.map((c) => ({ cityId: c.id, cityName: c.name, zoneCount: c._count.zones }));
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private async findCityOrThrow(id: string): Promise<City> {
    const city = await this.prisma.city.findFirst({ where: { id, deletedAt: null } });
    if (!city) throw new NotFoundException(`City ${id} not found`);
    return city;
  }
}
