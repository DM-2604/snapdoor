import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Store, UserRole } from '@prisma/client';
import { CurrentStore } from '../../shared/decorators/current-store.decorator';
import { CurrentUser, JwtPayload } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { StoreOwnerGuard } from '../../shared/guards/store-owner.guard';
import { BillingService } from './billing.service';
import {
  ListInvoicesQueryDto,
  ListSettlementsQueryDto,
  UpdateStoreBillingDto,
} from './dto/store-billing.dto';

@ApiTags('store — billing & settlements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, StoreOwnerGuard)
@Roles(UserRole.STORE_OWNER)
@Controller('store')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('billing')
  @ApiOperation({ summary: 'Get store billing settings, tax configuration, and linked payout account' })
  getBillingProfile(@CurrentStore() store: Store) {
    return this.billingService.getBillingProfile(store.id);
  }

  @Put('billing')
  @ApiOperation({ summary: 'Update GSTIN, PAN, billing contacts, and linked payout account' })
  updateBillingProfile(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateStoreBillingDto,
  ) {
    return this.billingService.updateBillingProfile(store.id, dto, user.sub);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'List platform commission invoices issued by LocalMart to the store' })
  listInvoices(
    @CurrentStore() store: Store,
    @Query() query: ListInvoicesQueryDto,
  ) {
    return this.billingService.listInvoices(store.id, query);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get details of a platform commission invoice' })
  getInvoice(
    @CurrentStore() store: Store,
    @Param('id') invoiceId: string,
  ) {
    return this.billingService.getInvoice(store.id, invoiceId);
  }

  @Get('settlements')
  @ApiOperation({ summary: 'List settlement payouts transferred to store payout account' })
  listSettlements(
    @CurrentStore() store: Store,
    @Query() query: ListSettlementsQueryDto,
  ) {
    return this.billingService.listSettlements(store.id, query);
  }

  @Get('settlements/:id')
  @ApiOperation({ summary: 'Get settlement breakdown (gross sales, commissions, net payable)' })
  getSettlement(
    @CurrentStore() store: Store,
    @Param('id') settlementId: string,
  ) {
    return this.billingService.getSettlement(store.id, settlementId);
  }

  @Get('financial-summary')
  @ApiOperation({ summary: 'Get month-to-date sales overview, commission totals, and pending payout balances' })
  getFinancialSummary(@CurrentStore() store: Store) {
    return this.billingService.getFinancialSummary(store.id);
  }
}
