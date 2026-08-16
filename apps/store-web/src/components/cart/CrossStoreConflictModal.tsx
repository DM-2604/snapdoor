'use client';

interface CrossStoreConflictModalProps {
  storeName: string;
  onConfirm: () => void | Promise<void>;
  onDismiss: () => void;
}

export function CrossStoreConflictModal({
  storeName,
  onConfirm,
  onDismiss,
}: CrossStoreConflictModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5 border border-neutral-200 dark:border-neutral-800">
        <div className="text-center space-y-2">
          <div className="text-4xl">🛒</div>
          <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
            Start a new cart?
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Your cart has items from{' '}
            <strong className="text-neutral-800 dark:text-neutral-100">{storeName}</strong>. Adding
            from a different store will clear your current cart.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-extrabold text-xs rounded-xl shadow-lg shadow-primary/20 transition-colors"
          >
            Clear cart &amp; add item
          </button>
          <button
            onClick={onDismiss}
            className="w-full py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors"
          >
            Keep current cart
          </button>
        </div>
      </div>
    </div>
  );
}
