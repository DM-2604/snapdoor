import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DocumentOwnerType,
  Document,
  DocType,
  PayoutAccount,
  PayoutAccountOwnerType,
  PayoutAccountType,
} from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../../shared/database/prisma.service';
import { RejectDocumentDto } from './dto/reject-document.dto';
import {
  CreatePayoutAccountDto,
  UploadKycDocumentDto,
  GetUploadUrlDto,
} from './dto/store-documents.dto';

export const REQUIRED_DOCUMENT_TYPES: DocType[] = [
  DocType.PAN,
  DocType.GST_CERTIFICATE,
];

export interface KycChecklistItem {
  docType: DocType;
  isRequired: boolean;
  isUploaded: boolean;
  status: 'NOT_UPLOADED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason: string | null;
  documentId: string | null;
  fileUrl: string | null;
  verifiedAt: Date | null;
}

export interface KycStatusSummary {
  allRequiredUploaded: boolean;
  allRequiredVerified: boolean;
  missingRequiredDocs: DocType[];
  unverifiedRequiredDocs: DocType[];
  checklist: KycChecklistItem[];
  otherDocuments: Document[];
}

@Injectable()
export class DocumentsService {
  private supabase: SupabaseClient;

  constructor(private readonly prisma: PrismaService) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      console.warn('Supabase URL or Service Role Key missing. Document upload will not work.');
      // Initialize with dummy values so it doesn't crash on boot, but will fail on use
      this.supabase = createClient('https://dummy.supabase.co', 'dummy');
    }
  }

  /**
   * Get a pre-signed Supabase upload URL for client-side direct upload
   */
  async getUploadUrl(
    ownerUserId: string,
    dto: GetUploadUrlDto,
  ): Promise<{ uploadUrl: string; publicUrl: string }> {
    const ext = dto.fileName.split('.').pop();
    const path = `${ownerUserId}/${dto.docType}-${Date.now()}.${ext}`;

    const { data, error } = await this.supabase.storage
      .from('kyc-documents')
      .createSignedUploadUrl(path);

    if (error) {
      throw new BadRequestException(`Upload URL generation failed: ${error.message}`);
    }

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/kyc-documents/${path}`;
    return { uploadUrl: data.signedUrl, publicUrl };
  }

  /**
   * List all active documents for a given owner (STORE or STORE_OWNER).
   */
  async listByOwner(ownerType: DocumentOwnerType, ownerId: string): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { ownerType, ownerId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Upload or replace a KYC document for a store owner.
   */
  async uploadDocument(
    ownerType: DocumentOwnerType,
    ownerId: string,
    dto: UploadKycDocumentDto,
    userId: string,
  ): Promise<Document> {
    return this.prisma.$transaction(async (tx) => {
      // If a document of the same type already exists for this owner, soft-delete it
      const existing = await tx.document.findFirst({
        where: {
          ownerType,
          ownerId,
          docType: dto.docType,
          deletedAt: null,
        },
      });

      if (existing) {
        await tx.document.update({
          where: { id: existing.id },
          data: {
            deletedAt: new Date(),
            deletedBy: userId,
          },
        });
      }

      return tx.document.create({
        data: {
          ownerType,
          ownerId,
          docType: dto.docType,
          fileUrl: dto.fileUrl,
          verificationStatus: 'PENDING',
          createdBy: userId,
        },
      });
    });
  }

  /**
   * Get full KYC checklist status for a store and its owner.
   */
  async getKycStatus(storeId: string, ownerUserId: string): Promise<KycStatusSummary> {
    // Find all active documents uploaded by the owner (STORE_OWNER or STORE)
    const docs = await this.prisma.document.findMany({
      where: {
        deletedAt: null,
        OR: [
          { ownerType: DocumentOwnerType.STORE_OWNER, ownerId: ownerUserId },
          { ownerType: DocumentOwnerType.STORE, ownerId: storeId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const checklist: KycChecklistItem[] = REQUIRED_DOCUMENT_TYPES.map((reqType) => {
      const doc = docs.find((d) => d.docType === reqType);
      if (!doc) {
        return {
          docType: reqType,
          isRequired: true,
          isUploaded: false,
          status: 'NOT_UPLOADED',
          rejectionReason: null,
          documentId: null,
          fileUrl: null,
          verifiedAt: null,
        };
      }
      return {
        docType: reqType,
        isRequired: true,
        isUploaded: true,
        status: doc.verificationStatus,
        rejectionReason: doc.rejectionReason,
        documentId: doc.id,
        fileUrl: doc.fileUrl,
        verifiedAt: doc.verifiedAt,
      };
    });

    const missingRequiredDocs = checklist
      .filter((item) => !item.isUploaded)
      .map((item) => item.docType);

    const unverifiedRequiredDocs = checklist
      .filter((item) => item.status !== 'VERIFIED')
      .map((item) => item.docType);

    const allRequiredUploaded = missingRequiredDocs.length === 0;
    const allRequiredVerified = unverifiedRequiredDocs.length === 0;

    const otherDocuments = docs.filter(
      (d) => !REQUIRED_DOCUMENT_TYPES.includes(d.docType),
    );

    return {
      allRequiredUploaded,
      allRequiredVerified,
      missingRequiredDocs,
      unverifiedRequiredDocs,
      checklist,
      otherDocuments,
    };
  }

  /**
   * Helper used during Store approval to enforce all required documents are verified.
   */
  async areRequiredDocumentsVerified(
    storeId: string,
    ownerUserId: string,
  ): Promise<{ isVerified: boolean; unverifiedDocs: DocType[] }> {
    const kyc = await this.getKycStatus(storeId, ownerUserId);
    return {
      isVerified: kyc.allRequiredVerified,
      unverifiedDocs: kyc.unverifiedRequiredDocs,
    };
  }

  /**
   * Verify a single document (Admin action).
   */
  async verifyDocument(id: string, adminUserId: string): Promise<Document> {
    await this.findDocumentOrThrow(id);

    return this.prisma.document.update({
      where: { id },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedBy: adminUserId,
        verifiedAt: new Date(),
        rejectionReason: null,
        updatedBy: adminUserId,
      },
    });
  }

  /**
   * Reject a single document with reason (Admin action).
   */
  async rejectDocument(id: string, dto: RejectDocumentDto, adminUserId: string): Promise<Document> {
    await this.findDocumentOrThrow(id);

    return this.prisma.document.update({
      where: { id },
      data: {
        verificationStatus: 'REJECTED',
        rejectionReason: dto.reason,
        verifiedBy: adminUserId,
        verifiedAt: new Date(),
        updatedBy: adminUserId,
      },
    });
  }

  /**
   * Create or update payout account for a store.
   */
  async createPayoutAccount(
    storeId: string,
    dto: CreatePayoutAccountDto,
    userId: string,
  ): Promise<PayoutAccount> {
    if (dto.accountType === PayoutAccountType.BANK) {
      if (!dto.accountNumber || !dto.ifscCode) {
        throw new BadRequestException('accountNumber and ifscCode are required for BANK');
      }
    } else if (dto.accountType === PayoutAccountType.UPI) {
      if (!dto.upiVpa) {
        throw new BadRequestException('upiVpa is required for UPI payout account');
      }
    }

    // Mask bank account number if present: e.g. "••••••••9012"
    let accountNumberMasked: string | null = null;
    if (dto.accountNumber) {
      const len = dto.accountNumber.length;
      accountNumberMasked = len > 4
        ? '•'.repeat(len - 4) + dto.accountNumber.slice(-4)
        : dto.accountNumber;
    }

    return this.prisma.$transaction(async (tx) => {
      // Demote any existing primary accounts for this store
      await tx.payoutAccount.updateMany({
        where: {
          ownerType: PayoutAccountOwnerType.STORE,
          ownerId: storeId,
          deletedAt: null,
        },
        data: { isPrimary: false, updatedBy: userId },
      });

      return tx.payoutAccount.create({
        data: {
          ownerType: PayoutAccountOwnerType.STORE,
          ownerId: storeId,
          accountType: dto.accountType,
          accountHolderName: dto.accountHolderName ?? null,
          accountNumberMasked,
          ifscCode: dto.ifscCode ? dto.ifscCode.toUpperCase() : null,
          upiVpa: dto.upiVpa ?? null,
          isPrimary: true,
          verificationStatus: 'PENDING',
          createdBy: userId,
        },
      });
    });
  }

  /**
   * Get active primary payout account for a store.
   */
  async getPayoutAccount(storeId: string): Promise<PayoutAccount | null> {
    return this.prisma.payoutAccount.findFirst({
      where: {
        ownerType: PayoutAccountOwnerType.STORE,
        ownerId: storeId,
        isPrimary: true,
        deletedAt: null,
      },
    });
  }

  private async findDocumentOrThrow(id: string): Promise<Document> {
    const doc = await this.prisma.document.findFirst({ where: { id, deletedAt: null } });
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    return doc;
  }
}
