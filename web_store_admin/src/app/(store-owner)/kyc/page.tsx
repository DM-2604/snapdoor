'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileCheck,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Send,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { storeOwnerApi } from '@/lib/api';
import type { StoreOwnerDocument, KycStatus } from '@/lib/api-client';

const REQUIRED_DOCS: { docType: string; label: string; desc: string }[] = [
  { docType: 'PAN', label: 'PAN Card', desc: 'Permanent Account Number card' },
  { docType: 'GST_CERTIFICATE', label: 'GST Certificate', desc: 'Goods & Services Tax registration certificate' },
  { docType: 'SHOP_LICENSE', label: 'Shop License', desc: 'Municipal shop & establishment license' },
  { docType: 'AADHAAR', label: 'Aadhaar Card', desc: 'Optional — for address proof' },
  { docType: 'BANK_PROOF', label: 'Bank Proof', desc: 'Optional — cancelled cheque or bank statement' },
];

const statusMeta: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  PENDING: { label: 'Under Review', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  VERIFIED: { label: 'Verified', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  REJECTED: { label: 'Rejected', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
};

const storeMeta: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  DRAFT: { label: 'Draft', color: 'text-neutral-500', bg: 'bg-neutral-100 dark:bg-neutral-800', desc: 'Upload required documents and submit for review.' },
  PENDING: { label: 'Under Review', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', desc: 'Our team is verifying your documents. This usually takes 1–2 business days.' },
  LIVE: { label: 'Active', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', desc: 'Your store is live and documents are approved.' },
  SUSPENDED: { label: 'Suspended', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', desc: 'Your store has been suspended. Please contact support.' },
  REJECTED: { label: 'Rejected', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', desc: 'Your store application was rejected.' },
};

export default function KycPage() {
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [documents, setDocuments] = useState<StoreOwnerDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingDocTypes, setUploadingDocTypes] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    try {
      const [status, docs, profile] = await Promise.all([
        storeOwnerApi.getKycStatus().catch(() => null),
        storeOwnerApi.listDocuments().catch(() => []),
        storeOwnerApi.getProfile().catch(() => null),
      ]);
      if (status) {
        // Extend status with the actual store status from profile
        setKycStatus({ ...status, storeStatus: profile?.status ?? 'DRAFT' } as any);
      }
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch {
      setError('Failed to load KYC data. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let pollCount = 0;
    
    const getInterval = () => {
      if (pollCount < 6) return 5000;      // 0-30s: every 5s
      if (pollCount < 12) return 10000;    // 30s-2min: every 10s
      if (pollCount < 30) return 30000;    // 2-10min: every 30s
      return 60000;                        // 10min+: every 60s
    };
    
    const tick = () => {
      fetchData();
      pollCount++;
      clearInterval(interval);
      interval = setInterval(tick, getInterval());
    };
    
    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        pollCount = 0;
        tick();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibility);
    tick(); // Start immediately
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  function getDocForType(docType: string): StoreOwnerDocument | undefined {
    return documents.find((d) => d.docType === docType);
  }

  async function handleFileUpload(docType: string, file: File) {
    setUploadingDocTypes((prev) => new Set(prev).add(docType));
    setError(null);
    try {
      // Step 1: Get pre-signed upload URL from backend
      const { uploadUrl, publicUrl } = await storeOwnerApi.getDocumentUploadUrl({
        docType,
        fileName: file.name,
        contentType: file.type,
      });

      // Step 2: Upload file directly to Supabase (no backend involved)
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error('File upload to storage failed');

      // Step 3: Register the public URL with the backend
      await storeOwnerApi.uploadDocument({ docType, fileUrl: publicUrl });

      setSuccessMsg(`${docType.replace('_', ' ')} uploaded successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      await fetchData(); // refresh document list
    } catch (err: any) {
      setError(err.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploadingDocTypes((prev) => {
        const next = new Set(prev);
        next.delete(docType);
        return next;
      });
    }
  }

  async function handleSubmitForReview() {
    setIsSubmitting(true);
    setError(null);
    try {
      await storeOwnerApi.submitForReview();
      setSuccessMsg('Submitted for review! Our team will verify your documents within 1–2 business days.');
      await fetchData();
    } catch (err: any) {
      setError(err.message ?? 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const requiredUploaded = REQUIRED_DOCS.slice(0, 3).every((d) => !!getDocForType(d.docType));
  const storeStatus = kycStatus?.storeStatus ?? 'DRAFT';
  const storeMeta_ = storeMeta[storeStatus] ?? storeMeta.DRAFT;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">KYC Verification</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Upload documents to activate your store</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-emerald-600 hover:border-emerald-500 transition-all"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Error / Success banners */}
      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Status Banner */}
      <div className={`rounded-2xl border p-5 ${storeMeta_.bg} border-neutral-200 dark:border-neutral-800`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm border border-neutral-200 dark:border-neutral-700">
            <FileCheck size={20} className={storeMeta_.color} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-neutral-900 dark:text-white">Store Status:</p>
              <span className={`text-sm font-extrabold ${storeMeta_.color}`}>{storeMeta_.label}</span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{storeMeta_.desc}</p>
          </div>
        </div>
      </div>

      {/* Document Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REQUIRED_DOCS.map(({ docType, label, desc }) => {
          const doc = getDocForType(docType);
          const isUploading = uploadingDocTypes.has(docType);
          const docStatus = doc?.verificationStatus;
          const meta = docStatus ? statusMeta[docStatus] : null;
          const StatusIcon = meta?.icon;
          const isRequired = REQUIRED_DOCS.slice(0, 3).some((d) => d.docType === docType);

          return (
            <div
              key={docType}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-neutral-50 dark:bg-neutral-800 rounded-xl flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                    <FileText size={16} className="text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">
                      {label}
                      {isRequired && <span className="text-red-500 ml-1 text-xs">*</span>}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{desc}</p>
                  </div>
                </div>
                {meta && StatusIcon && (
                  <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${meta.bg} ${meta.color} shrink-0`}>
                    <StatusIcon size={11} />
                    {meta.label}
                  </span>
                )}
              </div>

              {doc?.rejectionReason && (
                <div className="mb-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2 border border-red-200 dark:border-red-500/20">
                  Rejection reason: {doc.rejectionReason}
                </div>
              )}

              {doc?.fileUrl && (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mb-3 text-xs text-emerald-600 dark:text-emerald-400 hover:underline truncate"
                >
                  📎 {doc.fileUrl.split('/').pop()}
                </a>
              )}

              {/* Upload button */}
              {(storeStatus !== 'PENDING' || docStatus === 'REJECTED') && (
                <>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    ref={(el) => { fileInputRefs.current[docType] = el; }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(docType, file);
                      e.target.value = ''; // reset
                    }}
                  />
                  <button
                    onClick={() => fileInputRefs.current[docType]?.click()}
                    disabled={isUploading || docStatus === 'VERIFIED'}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:border-emerald-500 dark:hover:text-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <><RefreshCw size={14} className="animate-spin" /> Uploading…</>
                    ) : docStatus === 'VERIFIED' ? (
                      <><CheckCircle2 size={14} /> Verified</>
                    ) : (
                      <><Upload size={14} /> {doc ? 'Re-upload' : 'Upload File'}</>
                    )}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit for Review */}
      {(storeStatus === 'DRAFT' || storeStatus === 'PENDING') && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-neutral-900 dark:text-white">Ready to submit?</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                {requiredUploaded
                  ? 'All required documents uploaded. You can submit for review.'
                  : 'Upload all required documents (marked with *) to enable submission.'}
              </p>
            </div>
            <button
              onClick={handleSubmitForReview}
              disabled={!requiredUploaded || isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed ml-4 shrink-0"
            >
              {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
              {isSubmitting ? 'Submitting…' : 'Submit for Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
