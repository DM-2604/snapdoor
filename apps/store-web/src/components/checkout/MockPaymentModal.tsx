'use client';

import { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface MockPaymentModalProps {
  onConfirm: (mockToken: string) => void | Promise<void>;
  onClose: () => void;
}

export function MockPaymentModal({ onConfirm, onClose }: MockPaymentModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Generate a deterministic mock token for the sandbox
      const mockToken = `mock_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
      await onConfirm(mockToken);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-sm w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-primary" />
            <span className="font-extrabold text-neutral-900 dark:text-white text-sm">
              Mock Payment Gateway
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-6 space-y-5">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 text-[11px] text-amber-800 dark:text-amber-200 font-medium">
            🧪 This is a <strong>test environment</strong>. No real money will be charged.
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                Card Number
              </span>
              <span className="font-mono font-bold text-neutral-800 dark:text-neutral-100">
                4111 1111 1111 1111
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                  Expiry
                </span>
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-100">12/29</span>
              </div>
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                  CVV
                </span>
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-100">123</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-extrabold text-sm rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Lock size={14} />
            {loading ? 'Processing payment…' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
