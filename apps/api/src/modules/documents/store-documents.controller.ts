import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DocumentOwnerType, Store, UserRole } from '@prisma/client';
import { CurrentStore } from '../../shared/decorators/current-store.decorator';
import { CurrentUser, JwtPayload } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { StoreOwnerGuard } from '../../shared/guards/store-owner.guard';
import { DocumentsService } from './documents.service';
import {
  CreatePayoutAccountDto,
  UploadKycDocumentDto,
  GetUploadUrlDto,
} from './dto/store-documents.dto';

@ApiTags('store — KYC & payouts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, StoreOwnerGuard)
@Roles(UserRole.STORE_OWNER)
@Controller('store')
export class StoreDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('documents/upload-url')
  @ApiOperation({ summary: 'Generate a pre-signed URL for direct document upload to Supabase' })
  getUploadUrl(
    @CurrentUser() user: JwtPayload,
    @Body() dto: GetUploadUrlDto,
  ) {
    return this.documentsService.getUploadUrl(user.sub, dto);
  }

  @Post('documents')
  @ApiOperation({ summary: 'Upload or replace a KYC document (PAN, GST, etc.)' })
  uploadDocument(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UploadKycDocumentDto,
  ) {
    return this.documentsService.uploadDocument(
      DocumentOwnerType.STORE_OWNER,
      user.sub,
      dto,
      user.sub,
    );
  }

  @Get('documents')
  @ApiOperation({ summary: 'List all documents uploaded for this store and owner' })
  listDocuments(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentsService.listByOwner(DocumentOwnerType.STORE_OWNER, user.sub);
  }

  @Get('kyc-status')
  @ApiOperation({ summary: 'Check KYC status and checklist for required documents' })
  getKycStatus(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentsService.getKycStatus(store.id, user.sub);
  }

  @Post('payout-account')
  @ApiOperation({ summary: 'Create or update payout bank account / UPI VPA for settlement payouts' })
  createPayoutAccount(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePayoutAccountDto,
  ) {
    return this.documentsService.createPayoutAccount(store.id, dto, user.sub);
  }

  @Get('payout-account')
  @ApiOperation({ summary: 'Get active payout account for this store' })
  getPayoutAccount(@CurrentStore() store: Store) {
    return this.documentsService.getPayoutAccount(store.id);
  }
}
