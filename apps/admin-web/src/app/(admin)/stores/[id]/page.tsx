'use client';
// app/(admin)/stores/[id]/page.tsx — Store detail + KYC review

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, Mail, CheckCircle, XCircle, FileText, Clock, Pencil } from 'lucide-react';
import { PageSpinner, DocumentPreview } from '@localmart/ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ApproveModal } from '@/components/stores/approve-modal';
import { storesApi, documentsApi } from '@/lib/api';
import type { StoreDetail } from '@localmart/api-client';
import type { Document } from '@localmart/api-client';
import { useStoreCatalogStore } from '@/stores/store-catalog.store';

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const {
    currentStore: store,
    documents: docs,
    loadingDetail: loading,
    docError,
    fetchDetail,
    verifyDocument,
    rejectDocument
  } = useStoreCatalogStore();

  const [approveOpen, setApproveOpen] = useState(false);

  useEffect(() => {
    fetchDetail(id);
  }, [id, fetchDetail]);

  async function handleVerifyDoc(docId: string) {
    await verifyDocument(docId);
  }

  async function handleRejectDoc(docId: string) {
    const reason = window.prompt('Rejection reason (required):');
    if (!reason) return;
    await rejectDocument(docId, reason);
  }

  async function handleRequestStoreChanges() {
    if (!store) return;
    const reason = window.prompt('Reason for requesting changes from the store owner:');
    if (!reason) return;
    try {
      await storesApi.requestChanges(store.id, reason);
      fetchDetail(store.id);
    } catch (e: any) {
      alert(e.message ?? 'Failed to request changes');
    }
  }

  if (loading) return <PageSpinner />;
  if (!store) return <p className="text-sm text-red-600">Store not found.</p>;

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-emerald-600 mb-5 transition-colors"
      >
        <ArrowLeft size={15} /> Back to stores
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-neutral-900">{store.name}</h1>
            <Badge variant={store.status as any}>{store.status}</Badge>
          </div>
          <p className="text-sm text-neutral-500 font-mono">{store.storeCode}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/stores/${store.id}/edit`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Pencil size={14} /> Edit Store
          </button>
          {(store.status === 'PENDING') && (
            <>
              {docs.some(d => d.verificationStatus === 'REJECTED') && (
                <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50" onClick={handleRequestStoreChanges}>
                  Request Changes
                </Button>
              )}
              <Button onClick={() => setApproveOpen(true)}>Review Store</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Store Info */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-[0_1px_3px_0_rgb(0,0,0,0.06)] p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4 uppercase tracking-wide">Store Details</h2>
          <dl className="space-y-3 text-sm">
            <InfoRow label="Category" value={store.businessCategory?.name} />
            <InfoRow label="City" value={store.city?.name} />
            <InfoRow label="Zone" value={store.zone?.name ?? '—'} />
            <InfoRow label="Address" value={store.address} />
            {store.location && (
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-neutral-600 font-mono text-xs">
                  {store.location.lat.toFixed(4)}, {store.location.lng.toFixed(4)}
                </span>
              </div>
            )}
            {store.effectiveCommissionPercent !== null && (
              <InfoRow label="Commission %" value={`${store.effectiveCommissionPercent}%`} />
            )}
          </dl>
        </div>

        {/* Owner Info */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-[0_1px_3px_0_rgb(0,0,0,0.06)] p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4 uppercase tracking-wide">Owner Contact</h2>
          <dl className="space-y-3 text-sm">
            <InfoRow label="Name" value={store.owner?.name ?? '—'} />
            <div className="flex items-center gap-2">
              <Phone size={13} className="text-neutral-400 shrink-0" />
              <span className="text-neutral-700">{store.owner?.phoneNumber}</span>
            </div>
            {store.owner?.email && (
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-neutral-400 shrink-0" />
                <span className="text-neutral-700">{store.owner.email}</span>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* KYC Documents */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-[0_1px_3px_0_rgb(0,0,0,0.06)] p-5 mb-5">
        <h2 className="text-sm font-semibold text-neutral-700 mb-4 uppercase tracking-wide flex items-center gap-2">
          <FileText size={14} className="text-emerald-600" />
          KYC Documents
        </h2>
        {docError && <p className="text-sm text-red-600 mb-3">{docError}</p>}
        {docs.length === 0 ? (
          <p className="text-sm text-neutral-400">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {docs.map(doc => (
              <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
                
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {doc.fileUrl !== undefined ? (
                    <DocumentPreview fileUrl={doc.fileUrl} docType={doc.docType} className="shrink-0 h-16 w-16" />
                  ) : (
                    <div className="h-16 w-16 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 shrink-0" />
                  )}
                  
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{formatDocType(doc.docType)}</p>
                    <div className="mt-1.5">
                      <Badge variant={doc.verificationStatus as any}>{doc.verificationStatus}</Badge>
                    </div>
                    {doc.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1.5 line-clamp-2">Rejection: {doc.rejectionReason}</p>
                    )}
                  </div>
                </div>

                {doc.verificationStatus === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0 sm:ml-4">
                    <Button
                      onClick={() => handleVerifyDoc(doc.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex-1 sm:flex-none"
                      size="sm"
                    >
                      <CheckCircle size={16} className="mr-1.5" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRejectDoc(doc.id)}
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 font-medium flex-1 sm:flex-none"
                      size="sm"
                    >
                      <XCircle size={16} className="mr-1.5" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval history */}
      {store.approvalQueue && store.approvalQueue.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-[0_1px_3px_0_rgb(0,0,0,0.06)] p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4 uppercase tracking-wide flex items-center gap-2">
            <Clock size={14} className="text-emerald-600" />
            Approval History
          </h2>
          <div className="space-y-2">
            {store.approvalQueue.map(q => (
              <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                <Badge variant={q.decision as any} className="mt-0.5 shrink-0">{q.decision}</Badge>
                <div className="flex-1 min-w-0">
                  {q.decisionReason && <p className="text-xs text-neutral-600">{q.decisionReason}</p>}
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {q.reviewedAt ? new Date(q.reviewedAt).toLocaleString() : new Date(q.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approve Modal */}
      <ApproveModal
        storeId={store.id}
        storeName={store.name}
        open={approveOpen}
        onOpenChange={setApproveOpen}
        onSuccess={() => fetchDetail(store.id)}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-neutral-500 shrink-0">{label}</dt>
      <dd className="text-neutral-800 font-medium text-right">{value ?? '—'}</dd>
    </div>
  );
}

function formatDocType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
