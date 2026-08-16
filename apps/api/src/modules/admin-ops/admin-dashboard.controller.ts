// Implements v3 §5b — Admin Dashboard Controller

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../shared/decorators/roles.decorator';
import { PrismaService } from '../../shared/database/prisma.service';
import { PlatformConfigService } from '../platform-config/platform-config.service';

@ApiTags('admin — dashboard')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly platformConfigService: PlatformConfigService,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Platform dashboard summary — stores by status, zones per city, active fee plans, pending KYC docs',
  })
  async getSummary() {
    const [
      storesByStatus,
      zonesPerCity,
      activeFeePlansCount,
      totalDocumentsPending,
    ] = await Promise.all([
      this.prisma.store.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { deletedAt: null },
      }),
      this.platformConfigService.listZonesPerCity(),
      this.platformConfigService.countActiveFeePlans(),
      this.prisma.document.count({
        where: { verificationStatus: 'PENDING', deletedAt: null },
      }),
    ]);

    return {
      stores: Object.fromEntries(
        storesByStatus.map((row) => [row.status, row._count.id]),
      ),
      zonesPerCity,
      activeFeePlansCount,
      totalDocumentsPending,
    };
  }
}
