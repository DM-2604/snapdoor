import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { Prisma, CommissionRule } from '@prisma/client';

export interface CommissionSearchResult {
  data: CommissionRule[];
  nextCursor: string | null;
  totalCount: number;
}

import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListCommissionRulesDto {
  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zoneId?: string;

  @IsOptional()
  @IsString()
  effectiveDate?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  searchQuery?: string;
}

@Injectable()
export class PrismaCommissionSearchService {
  constructor(private prisma: PrismaService) {}

  async search(dto: ListCommissionRulesDto): Promise<CommissionSearchResult> {
    const limit = Math.min(Number(dto.limit) || 20, 100);
    
    const where: Prisma.CommissionRuleWhereInput = {};
    
    if (dto.cityId) where.cityId = dto.cityId;
    if (dto.zoneId) where.zoneId = dto.zoneId;
    if (dto.state) {
      where.OR = [
        { cityId: null },
        { city: { state: dto.state } },
      ];
    }
    if (dto.effectiveDate) {
      const date = new Date(dto.effectiveDate);
      where.effectiveFrom = { lte: date };
      where.AND = [
        {
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: date } },
          ]
        }
      ];
    }

    const totalCount = await this.prisma.commissionRule.count({ where });

    const results = await this.prisma.commissionRule.findMany({
      where,
      take: limit + 1,
      cursor: dto.cursor ? { id: dto.cursor } : undefined,
      skip: dto.cursor ? 1 : undefined,
      orderBy: { id: 'desc' },
      include: { city: true, zone: true, category: true },
    });

    let nextCursor: string | null = null;
    if (results.length > limit) {
      results.pop();
      nextCursor = results[results.length - 1].id;
    }

    return { data: results, nextCursor, totalCount };
  }
}
