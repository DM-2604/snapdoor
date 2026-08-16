import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StoreBilling } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import {
  ListInvoicesQueryDto,
  ListSettlementsQueryDto,
  UpdateStoreBillingDto,
} from './dto/store-billing.dto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Store Billing Profile ─────────────────────────────────────────────────

  async getBillingProfile(storeId: string) {
    let billing = await this.prisma.storeBilling.findFirst({
      where: { storeId, deletedAt: null },
      include: {
        platformFeePlan: true,
        payoutAccount: true,
      },
    });

    if (!billing) {
      // Find or assign a default platform fee plan for the store's city
      const store = await this.prisma.store.findFirst({
        where: { id: storeId, deletedAt: null },
      });
      if (!store) throw new NotFoundException(`Store ${storeId} not found`);

      let plan = await this.prisma.platformFeePlan.findFirst({
        where: {
          OR: [{ cityId: store.cityId }, { cityId: null }],
          isActive: true,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!plan) {
        // Fallback or create default plan
        plan = await this.prisma.platformFeePlan.create({
          data: {
            name: 'Standard Commission Plan',
            planType: 'COMMISSION_BASED',
            billingFrequency: 'MONTHLY',
            isActive: true,
            effectiveFrom: new Date(),
          },
        });
      }

      billing = await this.prisma.storeBilling.create({
        data: {
          storeId,
          platformFeePlanId: plan.id,
        },
        include: {
          platformFeePlan: true,
          payoutAccount: true,
        },
      });
    }

    return billing;
  }

  async updateBillingProfile(
    storeId: string,
    dto: UpdateStoreBillingDto,
    actorUserId: string,
  ) {
    const existing = await this.getBillingProfile(storeId);

    if (dto.payoutAccountId) {
      const payoutAccount = await this.prisma.payoutAccount.findFirst({
        where: { id: dto.payoutAccountId, deletedAt: null },
      });
      if (!payoutAccount) {
        throw new BadRequestException(`Payout account ${dto.payoutAccountId} not found`);
      }
    }

    const data: Prisma.StoreBillingUpdateInput = {
      updatedBy: actorUserId,
    };

    if (dto.gstNumber !== undefined) data.gstNumber = dto.gstNumber;
    if (dto.gstRegistered !== undefined) data.gstRegistered = dto.gstRegistered;
    if (dto.panNumber !== undefined) data.panNumber = dto.panNumber;
    if (dto.gstInvoiceRequired !== undefined) data.gstInvoiceRequired = dto.gstInvoiceRequired;
    if (dto.billingEmail !== undefined) data.billingEmail = dto.billingEmail;
    if (dto.billingContactPhone !== undefined) data.billingContactPhone = dto.billingContactPhone;
    if (dto.payoutAccountId !== undefined) {
      data.payoutAccount = dto.payoutAccountId
        ? { connect: { id: dto.payoutAccountId } }
        : { disconnect: true };
    }

    return this.prisma.storeBilling.update({
      where: { id: existing.id },
      data,
      include: {
        platformFeePlan: true,
        payoutAccount: true,
      },
    });
  }

  // ── Platform Invoices (LocalMart billing Store) ───────────────────────────

  async listInvoices(storeId: string, query: ListInvoicesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.InvoiceWhereInput = {
      storeId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        orderBy: { periodStart: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getInvoice(storeId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, storeId },
      include: {
        storeBilling: {
          include: { payoutAccount: true, platformFeePlan: true },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    return invoice;
  }

  // ── Settlements & Payouts ─────────────────────────────────────────────────

  async listSettlements(storeId: string, query: ListSettlementsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.SettlementWhereInput = {
      storeId,
      ...(query.status ? { payoutStatus: query.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.settlement.findMany({
        where,
        include: {
          payoutAccount: {
            select: {
              accountHolderName: true,
              accountNumberMasked: true,
              ifscCode: true,
              upiVpa: true,
            },
          },
        },
        orderBy: { periodEnd: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.settlement.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getSettlement(storeId: string, settlementId: string) {
    const settlement = await this.prisma.settlement.findFirst({
      where: { id: settlementId, storeId },
      include: {
        payoutAccount: true,
      },
    });

    if (!settlement) {
      throw new NotFoundException(`Settlement ${settlementId} not found`);
    }

    return settlement;
  }

  // ── Financial Summary ─────────────────────────────────────────────────────

  async getFinancialSummary(storeId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Aggregate completed orders for this month
    const completedOrders = await this.prisma.order.findMany({
      where: {
        storeId,
        status: 'COMPLETED',
        completedAt: { gte: startOfMonth },
      },
      select: {
        totalAmount: true,
        commissionAmount: true,
        channel: true,
      },
    });

    let currentMonthGross = 0;
    let currentMonthCommission = 0;
    let posSales = 0;
    let appSales = 0;

    for (const ord of completedOrders) {
      const total = Number(ord.totalAmount);
      const commission = Number(ord.commissionAmount);
      currentMonthGross += total;
      currentMonthCommission += commission;

      if (ord.channel === 'POS') {
        posSales += total;
      } else {
        appSales += total;
      }
    }

    // Pending settlements
    const pendingSettlements = await this.prisma.settlement.findMany({
      where: {
        storeId,
        payoutStatus: 'PENDING',
      },
      select: { netPayable: true },
    });

    const pendingPayoutTotal = pendingSettlements.reduce(
      (acc, s) => acc + Number(s.netPayable),
      0,
    );

    return {
      period: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,
      currentMonthGrossSales: currentMonthGross,
      currentMonthCommission: currentMonthCommission,
      currentMonthAppSales: appSales,
      currentMonthPosSales: posSales,
      currentMonthNetEarnings: currentMonthGross - currentMonthCommission,
      pendingPayoutBalance: pendingPayoutTotal,
    };
  }
}
