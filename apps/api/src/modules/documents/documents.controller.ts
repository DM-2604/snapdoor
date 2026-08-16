// Implements v3 §5a — Documents Controller
// All routes: @Roles('ADMIN')

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../shared/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';
import { RejectDocumentDto } from './dto/reject-document.dto';
import { DocumentOwnerType } from '@prisma/client';

@ApiTags('admin — KYC documents')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({
    summary: 'List KYC documents for a given owner (ownerType=STORE or USER)',
  })
  @ApiQuery({ name: 'ownerType', enum: ['STORE', 'USER', 'STORE_OWNER'], required: true })
  @ApiQuery({ name: 'ownerId', type: String, required: true, description: 'UUID of the owner entity' })
  listByOwner(
    @Query('ownerType') ownerType: DocumentOwnerType,
    @Query('ownerId') ownerId: string,
  ) {
    return this.documentsService.listByOwner(ownerType, ownerId);
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify a KYC document — marks it VERIFIED, does not change Store.status',
  })
  verify(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.documentsService.verifyDocument(id, user.sub);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject a KYC document with a mandatory reason — does NOT set Store.status to REJECTED (use /stores/:id/reject for terminal store rejection)',
  })
  reject(
    @Param('id') id: string,
    @Body() dto: RejectDocumentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentsService.rejectDocument(id, dto, user.sub);
  }
}
