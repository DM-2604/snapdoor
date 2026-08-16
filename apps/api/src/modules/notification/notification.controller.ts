import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../shared/decorators/current-user.decorator';

/**
 * NotificationController
 * Sequence diagrams: 9.1-9.10 (receives events from all modules)
 *
 * TODO: Implement routes per LLD sequence diagrams.
 */
@ApiTags('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // TODO: Add route handlers referencing sequence diagrams 9.1-9.10 (receives events from all modules)
  // Stub health route for build verification
  @Get('health')
  @ApiOperation({ summary: 'Notification module health check' })
  health() {
    return { module: 'notification', status: 'ok' };
  }
}
