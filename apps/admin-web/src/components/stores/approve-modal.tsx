'use client';
// components/stores/approve-modal.tsx
// Three-action modal: Approve / Request Changes / Reject
// Matches the three-path distinction in StoreCatalogService (see DECISIONS.md §2)

import { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { storesApi } from '@/lib/api';

type Action = 'approve' | 'request-changes' | 'reject';

interface ApproveModalProps {
  storeId: string;
  storeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ApproveModal({ storeId, storeName, open, onOpenChange, onSuccess }: ApproveModalProps) {
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function reset() {
    setAction(null);
    setReason('');
    setError('');
  }

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      if (action === 'approve') {
        await storesApi.approve(storeId);
      } else if (action === 'request-changes') {
        if (!reason.trim()) { setError('Please provide a reason for requesting changes.'); return; }
        await storesApi.requestChanges(storeId, reason.trim());
      } else if (action === 'reject') {
        if (!reason.trim()) { setError('Please provide a rejection reason.'); return; }
        await storesApi.reject(storeId, reason.trim());
      }
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? 'Action failed');
    } finally {
      setLoading(false);
    }
  }

  const ACTIONS = [
    {
      id: 'approve' as const,
      label: 'Approve Store',
      description: 'Store goes live immediately. Commission rate is auto-calculated.',
      icon: <CheckCircle size={18} />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200 hover:border-emerald-600',
    },
    {
      id: 'request-changes' as const,
      label: 'Request Changes',
      description: 'Non-terminal. Store stays PENDING. Owner can fix issues and resubmit.',
      icon: <AlertCircle size={18} />,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200 hover:border-amber-600',
    },
    {
      id: 'reject' as const,
      label: 'Reject Permanently',
      description: 'Terminal. Store is permanently rejected. Owner cannot resubmit.',
      icon: <XCircle size={18} />,
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200 hover:border-red-600',
    },
  ];

  return (
    <Modal
      open={open}
      onOpenChange={v => { if (!v) reset(); onOpenChange(v); }}
      title={`Review: ${storeName}`}
      description="Choose one of the three review actions below."
      maxWidth="max-w-lg"
    >
      {!action ? (
        // Step 1: choose action
        <div className="space-y-3">
          {ACTIONS.map(a => (
            <button
              key={a.id}
              onClick={() => setAction(a.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 ${a.bg}`}
            >
              <div className={`flex items-center gap-2.5 font-semibold text-sm mb-1 ${a.color}`}>
                {a.icon} {a.label}
              </div>
              <p className="text-xs text-neutral-500 ml-7">{a.description}</p>
            </button>
          ))}
        </div>
      ) : (
        // Step 2: confirm (with reason if needed)
        <div className="space-y-4">
          <div className={`p-3 rounded-lg border ${ACTIONS.find(a => a.id === action)?.bg}`}>
            <div className={`flex items-center gap-2 font-semibold text-sm ${ACTIONS.find(a => a.id === action)?.color}`}>
              {ACTIONS.find(a => a.id === action)?.icon}
              {ACTIONS.find(a => a.id === action)?.label}
            </div>
          </div>

          {action !== 'approve' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Reason <span className="text-red-600">*</span>
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder={action === 'request-changes'
                  ? 'e.g. AADHAAR photo is blurry, please re-upload…'
                  : 'e.g. Fraudulent documents submitted…'}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent resize-none transition"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" onClick={() => { setAction(null); setError(''); }} className="flex-1" disabled={loading}>
              Back
            </Button>
            <Button
              variant={action === 'approve' ? 'primary' : action === 'request-changes' ? 'warning' : 'danger'}
              onClick={handleSubmit}
              className="flex-1"
              disabled={loading}
            >
              {loading ? <Spinner size={14} /> : null}
              Confirm {action === 'approve' ? 'Approval' : action === 'request-changes' ? 'Request' : 'Rejection'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
