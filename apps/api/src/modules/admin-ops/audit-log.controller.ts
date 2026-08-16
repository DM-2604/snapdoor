// Implements v3 §5b + §F — Audit Log Controller

import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../shared/decorators/roles.decorator';
import { AuditLogService } from './audit-log.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

@ApiTags('admin — audit log')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({
    summary: 'Paginated, filterable audit trail — filter by entityType, entityId, actorUserId',
  })
  list(@Query() query: AuditLogQueryDto) {
    return this.auditLogService.list(query);
  }
}
