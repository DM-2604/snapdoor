// Implements v3 §4 — Store Catalog Service
//
// Owns: Store, StoreApprovalQueue, Category.
// Document and PayoutAccount are owned by DocumentsService — accessed via DocumentsService.
//
// ──────────────────────────────────────────────────────────────────────────────
// CRITICAL RULE — Three levels of store action (Addendum C):
// ──────────────────────────────────────────────────────────────────────────────
//   approveStore()      → Store.status = LIVE        (APPROVED queue row)
//   requestChanges()    → Store.status stays PENDING  (REJECTED queue row, non-terminal)
//   rejectStore()       → Store.status = REJECTED     (REJECTED queue row, TERMINAL)
//
// Never collapse requestChanges() and rejectStore() into a single path.
// See DECISIONS.md §2 and store-catalog/README.md for the full rationale.
// ──────────────────────────────────────────────────────────────────────────────

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CommissionResolverService } from '../platform-config/commission-resolver.service';
import { AuditLogService } from '../admin-ops/audit-log.service';
import { DocumentsService, REQUIRED_DOCUMENT_TYPES } from '../documents/documents.service';
import {
  STORE_NOTIFICATION_SERVICE,
  IStoreNotificationService,
} from '../admin-ops/store-notification.interface';
import { getStoreLocation, setStoreLocation } from '../../shared/database/geo';
import { ListStoresQueryDto } from './dto/list-stores-query.dto';
import { RejectStoreDto } from './dto/reject-store.dto';
import { RequestChangesDto } from './dto/request-changes.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateStoreAdminDto } from './dto/create-store-admin.dto';
import { UpdateStoreAdminDto } from './dto/update-store-admin.dto';
import {
  Category,
  KycStatus,
  OnboardingSource,
  Store,
  StoreStatus,
  UserRole,
} from '@prisma/client';

@Injectable()
export class StoreCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commissionResolver: CommissionResolverService,
    private readonly auditLog: AuditLogService,
    private readonly documentsService: DocumentsService,
    @Inject(STORE_NOTIFICATION_SERVICE)
    private readonly notificationService: IStoreNotificationService,
  ) {}

  // ── Admin Store Creation (v3 Addendum §2) ──────────────────────────────────

  async createStoreByAdmin(dto: CreateStoreAdminDto, adminUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Normalize phone to E.164: if it starts with digits (e.g. 9000000000), prepend +91
      const rawPhone = dto.ownerPhoneNumber.trim();
      const normalizedPhone = rawPhone.startsWith('+')
        ? rawPhone
        : `+91${rawPhone.replace(/^0/, '')}`;

      // 1. Find or create User by phone number
      let user = await tx.user.findFirst({
        where: { phoneNumber: normalizedPhone, deletedAt: null },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            phoneNumber: normalizedPhone,
            name: dto.ownerName ?? null,
            role: UserRole.STORE_OWNER,
            createdBy: adminUserId,
          },
        });

        await tx.storeOwner.create({
          data: {
            userId: user.id,
            kycStatus: KycStatus.NOT_STARTED,
            createdBy: adminUserId,
          },
        });
      } else {
        if (user.role === UserRole.ADMIN || user.role === UserRole.DELIVERY_PARTNER) {
          throw new BadRequestException(
            `Cannot assign store ownership to an account with role ${user.role}`,
          );
        }

        if (user.role === UserRole.STORE_OWNER) {
          const existingStore = await tx.store.findFirst({
            where: { ownerUserId: user.id, deletedAt: null },
          });
          if (existingStore) {
            throw new ConflictException(
              `This user already owns store '${existingStore.name}' (${existingStore.id})`,
            );
          }
        } else {
          // Upgrade existing CUSTOMER to STORE_OWNER
          await tx.user.update({
            where: { id: user.id },
            data: {
              role: UserRole.STORE_OWNER,
              name: user.name || dto.ownerName || null,
              updatedBy: adminUserId,
            },
          });

          const existingStoreOwner = await tx.storeOwner.findFirst({
            where: { userId: user.id },
          });

          if (!existingStoreOwner) {
            await tx.storeOwner.create({
              data: {
                userId: user.id,
                kycStatus: KycStatus.NOT_STARTED,
                createdBy: adminUserId,
              },
            });
          }
        }
      }

      // Generate unique store code if not supplied
      let storeCode = dto.storeCode?.trim().toUpperCase();
      if (!storeCode) {
        let attempts = 0;
        while (attempts < 5) {
          storeCode = await this.generateStoreCode(dto.name);
          const duplicate = await tx.store.findFirst({ where: { storeCode, deletedAt: null } });
          if (!duplicate) break;
          attempts++;
        }
        if (attempts >= 5) {
          throw new ConflictException('Failed to generate a unique store code after 5 attempts');
        }
      } else {
        // Verify uniqueness of supplied storeCode
        const duplicateCode = await tx.store.findFirst({
          where: { storeCode, deletedAt: null },
        });
        if (duplicateCode) {
          throw new ConflictException(`Store code '${storeCode}' is already in use`);
        }
      }

      // Create Store in DRAFT status
      const store = await tx.store.create({
        data: {
          ownerUserId: user.id,
          name: dto.name,
          storeCode: storeCode!,
          businessCategoryId: dto.businessCategoryId,
          cityId: dto.cityId,
          zoneId: dto.zoneId ?? null,
          address: dto.address,
          deliveryRadiusKm: dto.deliveryRadiusKm ?? 5.0, // default to 5km if not provided
          status: StoreStatus.DRAFT,
          onboardingSource: OnboardingSource.ASSISTED_FIELD_AGENT,
          createdBy: adminUserId,
        },
      });

      if (dto.latitude != null && dto.longitude != null) {
        await setStoreLocation(tx as any, store.id, dto.latitude, dto.longitude);
      }

      await this.auditLog.record(
        adminUserId,
        'STORE_CREATED_BY_ADMIN',
        'Store',
        store.id,
        null,
        { storeCode: storeCode!, ownerUserId: user.id, status: StoreStatus.DRAFT },
        tx as any,
      );

      return {
        ...store,
        ownerPhoneNumber: user.phoneNumber,
        missingRequiredDocuments: REQUIRED_DOCUMENT_TYPES,
      };
    });
  }

  // ── Admin Store Update ────────────────────────────────────────────────────

  async updateStoreByAdmin(id: string, dto: UpdateStoreAdminDto, adminUserId: string) {
    const store = await this.findStoreOrThrow(id);

    const updated = await this.prisma.store.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.businessCategoryId !== undefined && { businessCategoryId: dto.businessCategoryId }),
        ...(dto.cityId !== undefined && { cityId: dto.cityId }),
        ...(dto.zoneId !== undefined && { zoneId: dto.zoneId ?? null }),
        ...(dto.deliveryRadiusKm !== undefined && { deliveryRadiusKm: dto.deliveryRadiusKm }),
        updatedBy: adminUserId,
      },
    });

    if (dto.latitude != null && dto.longitude != null) {
      await setStoreLocation(this.prisma as any, id, dto.latitude, dto.longitude);
    }

    await this.auditLog.record(
      adminUserId,
      'STORE_UPDATED_BY_ADMIN',
      'Store',
      id,
      store,
      dto as Record<string, unknown>,
    );

    return this.getStore(id);
  }

  // ── Store listing ────────────────────────────────────────────────────────────

  async listStoresPending(query: ListStoresQueryDto) {
    return this.listStores({ ...query, status: 'PENDING' });
  }

  async listStores(query: ListStoresQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: any = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.cityId ? { cityId: query.cityId } : {}),
      ...(query.zoneId ? { zoneId: query.zoneId } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { storeCode: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, phoneNumber: true, email: true } },
          city: { select: { id: true, name: true } },
          zone: { select: { id: true, name: true } },
          businessCategory: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.store.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  // ── Store detail (Addendum B) ────────────────────────────────────────────────

  async getStore(id: string) {
    const store = await this.prisma.store.findFirst({
      where: { id, deletedAt: null },
      include: {
        owner: { select: { id: true, name: true, phoneNumber: true, email: true } },
        city: { select: { id: true, name: true } },
        zone: { select: { id: true, name: true } },
        businessCategory: { select: { id: true, name: true } },
        billing: true,
        approvalQueue: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!store) throw new NotFoundException(`Store ${id} not found`);

    // Decode PostGIS geometry to lat/lng — see geo.ts for raw SQL rationale
    const location = await getStoreLocation(this.prisma as any, id);

    return { ...store, location };
  }

  // ── Approve ──────────────────────────────────────────────────────────────────

  async approveStore(id: string, adminUserId: string): Promise<Store> {
    const store = await this.findStoreOrThrow(id);

    // Lifecycle check: only PENDING stores can be approved
    if (store.status !== StoreStatus.PENDING) {
      throw new BadRequestException(
        `Store must be in PENDING status before approval. Current status: ${store.status}`,
      );
    }

    // KYC check: all REQUIRED_DOCUMENT_TYPES must be verified
    const { isVerified, unverifiedDocs } = await this.documentsService.areRequiredDocumentsVerified(
      id,
      store.ownerUserId,
    );

    if (!isVerified) {
      throw new BadRequestException(
        `Cannot approve store: required KYC documents (${unverifiedDocs.join(', ')}) are not verified.`,
      );
    }

    // FIXME:COMMISSION_GUARD — effectiveCommissionPercent ONLY written via CommissionResolverService
    await this.commissionResolver.applyEffectiveRateToStore(id);

    const updated = await this.prisma.store.update({
      where: { id },
      data: { status: StoreStatus.LIVE, updatedBy: adminUserId },
    });

    await this.prisma.storeApprovalQueue.create({
      data: {
        storeId: id,
        reviewedByAdminId: adminUserId,
        decision: 'APPROVED',
        reviewedAt: new Date(),
        createdBy: adminUserId,
      },
    });

    await this.auditLog.record(
      adminUserId,
      'STORE_APPROVED',
      'Store',
      id,
      { status: store.status },
      { status: StoreStatus.LIVE },
    );
    await this.notificationService.notifyStoreApprovalDecision(id, 'APPROVED');

    return updated;
  }

  // ── Request Changes (Addendum C — non-terminal) ──────────────────────────────

  async requestChanges(storeId: string, dto: RequestChangesDto, adminUserId: string): Promise<Store> {
    const store = await this.findStoreOrThrow(storeId);

    // ⚠️  Store.status intentionally stays PENDING — the owner can fix and resubmit.
    // This is NOT a terminal rejection. See DECISIONS.md §2.
    await this.prisma.storeApprovalQueue.create({
      data: {
        storeId,
        reviewedByAdminId: adminUserId,
        decision: 'REJECTED', // marks queue row as not-approved
        decisionReason: dto.reason,
        reviewedAt: new Date(),
        createdBy: adminUserId,
      },
    });

    await this.auditLog.record(
      adminUserId,
      'STORE_REQUEST_CHANGES',
      'Store',
      storeId,
      { status: store.status },
      { status: store.status, reason: dto.reason }, // status unchanged
    );

    await this.notificationService.notifyStoreApprovalDecision(storeId, 'REQUEST_CHANGES', dto.reason);

    // Return the store unchanged (status stays PENDING)
    return store;
  }

  // ── Reject permanently (Addendum C — terminal) ───────────────────────────────

  async rejectStore(id: string, dto: RejectStoreDto, adminUserId: string): Promise<Store> {
    const store = await this.findStoreOrThrow(id);

    // Terminal action — sets Store.status to REJECTED permanently.
    // After this, the owner cannot resubmit. Use requestChanges() for non-terminal feedback.
    const updated = await this.prisma.store.update({
      where: { id },
      data: {
        status: StoreStatus.REJECTED,
        rejectionReason: dto.reason,
        updatedBy: adminUserId,
      },
    });

    await this.prisma.storeApprovalQueue.create({
      data: {
        storeId: id,
        reviewedByAdminId: adminUserId,
        decision: 'REJECTED',
        decisionReason: dto.reason,
        reviewedAt: new Date(),
        createdBy: adminUserId,
      },
    });

    await this.auditLog.record(
      adminUserId,
      'STORE_REJECTED',
      'Store',
      id,
      { status: store.status },
      { status: StoreStatus.REJECTED, reason: dto.reason },
    );

    await this.notificationService.notifyStoreApprovalDecision(id, 'REJECTED', dto.reason);

    return updated;
  }

  // ── Category Management (Addendum E — platform taxonomy) ─────────────────────

  async createCategory(dto: CreateCategoryDto, actorUserId?: string): Promise<Category> {
    if (dto.parentCategoryId) {
      const parent = await this.prisma.category.findFirst({
        where: { id: dto.parentCategoryId, deletedAt: null },
      });
      if (!parent) throw new NotFoundException(`Parent category ${dto.parentCategoryId} not found`);
    }

    return this.prisma.category.create({
      data: {
        parentCategoryId: dto.parentCategoryId,
        name: dto.name,
        iconUrl: dto.iconUrl,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        createdBy: actorUserId,
      },
    });
  }

  async listCategories(): Promise<Category[]> {
    // Returns global platform verticals only (storeId = null).
    // Store-owned sub-categories (storeId != null) are scoped to each store and never shown to super admin.
    return this.prisma.category.findMany({
      where: { storeId: null, deletedAt: null },
      orderBy: [{ parentCategoryId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto, actorUserId?: string): Promise<Category> {
    const category = await this.prisma.category.findFirst({ where: { id, deletedAt: null } });
    if (!category) throw new NotFoundException(`Category ${id} not found`);

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        iconUrl: dto.iconUrl,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
        parentCategoryId: dto.parentCategoryId,
        updatedBy: actorUserId,
      },
    });
  }

  async deleteCategory(id: string, actorUserId: string): Promise<void> {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
    });
    if (!category) throw new NotFoundException(`Category ${id} not found`);

    // Guard: block deletion if any store (not soft-deleted) still maps to this vertical
    const storeCount = await this.prisma.store.count({
      where: { businessCategoryId: id, deletedAt: null },
    });
    if (storeCount > 0) {
      throw new ConflictException(
        `Cannot delete this vertical — ${storeCount} store${storeCount > 1 ? 's are' : ' is'} still assigned to it. Re-assign those stores first.`,
      );
    }

    await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorUserId },
    });

    await this.auditLog.record(
      actorUserId,
      'CATEGORY_DELETED',
      'Category',
      id,
      { name: category.name, parentCategoryId: category.parentCategoryId },
      null,
    );
  }


  // ── Private helpers ──────────────────────────────────────────────────────────

  private async findStoreOrThrow(id: string): Promise<Store> {
    const store = await this.prisma.store.findFirst({ where: { id, deletedAt: null } });
    if (!store) throw new NotFoundException(`Store ${id} not found`);
    return store;
  }

  private async generateStoreCode(name: string): Promise<string> {
    const prefix = name
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 4)
      .padEnd(4, 'X');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomSuffix}`;
  }
}
