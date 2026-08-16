'use client';
// app/(admin)/categories/page.tsx — Platform business verticals management

import { useEffect, useState, useCallback } from 'react';
import { Plus, Tag, Edit2, Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { Modal } from '@/components/ui/modal';
import { categoriesApi } from '@/lib/api';
import type { Category } from '@localmart/api-client';
import { useCategoryStore } from '@/stores/category.store';

const INPUT_CLS = 'w-full py-3 rounded-xl border border-neutral-300 bg-neutral-50 px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition-all';

export default function CategoriesPage() {
  const { categories, loading, modalState: modal, setModalState: setModal, fetchCategories } = useCategoryStore();

  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function openCreate() {
    setName(''); setSortOrder('0');
    // Never pass a parentId — super admin only creates top-level verticals
    setModal({ mode: 'create' });
  }

  function openEdit(cat: Category) {
    setName(cat.name); setSortOrder(String(cat.sortOrder));
    setModal({ mode: 'edit', cat });
  }

  function openDelete(cat: Category) {
    setDeleteTarget(cat);
    setDeleteError(null);
  }

  function closeDelete() {
    setDeleteTarget(null);
    setDeleteError(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await categoriesApi.delete(deleteTarget.id);
      fetchCategories();
      closeDelete();
    } catch (e: any) {
      setDeleteError(e?.message ?? 'Failed to delete vertical.');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modal) return;
    setSubmitting(true);
    try {
      if (modal.mode === 'create') {
        // parentCategoryId is intentionally omitted — creating verticals only
        await categoriesApi.create({ name, sortOrder: parseInt(sortOrder) });
      } else {
        await categoriesApi.update(modal.cat.id, { name, sortOrder: parseInt(sortOrder) });
      }
      setModal(null);
      fetchCategories();
    } catch (e: any) { /* ignore */ }
    finally { setSubmitting(false); }
  }

  // Only top-level verticals (parentCategoryId == null) shown — store-admin categories are scoped to stores
  const verticals = categories.filter(c => !c.parentCategoryId);

  if (loading) return <PageSpinner />;

  return (
    <div className="animate-fade-in max-w-3xl">
      <PageHeader
        title="Business Verticals"
        description="Platform-level store types (Grocery, Pharmacy, Bakery…). Store admins create their own product categories inside their store."
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} /> Add Vertical
          </Button>
        }
      />

      {/* Info note */}
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">
        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-blue-500" />
        <p>
          Verticals are created here by super admin only. Store owners manage their own product sub-categories
          (Fruits, Dairy…) inside their store dashboard — those are not shown here.
          A vertical <strong>cannot be deleted</strong> while stores are assigned to it.
        </p>
      </div>

      {verticals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12 text-center text-sm text-neutral-400">
          No verticals yet. Add a business vertical (e.g. Grocery, Pharmacy) to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {verticals.map(vertical => (
            <div key={vertical.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3.5">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <Tag size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{vertical.name}</p>
                    <p className="text-xs text-neutral-400 font-mono">
                      sort {vertical.sortOrder} · id: {vertical.id.slice(0, 8)}…
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Edit */}
                  <button
                    onClick={() => openEdit(vertical)}
                    title="Edit vertical"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => openDelete(vertical)}
                    title="Delete vertical"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal
        open={!!modal}
        onOpenChange={v => !v && setModal(null)}
        title={modal?.mode === 'edit' ? `Edit: ${modal.cat.name}` : 'Add Business Vertical'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cat-name" className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Name</label>
            <input
              id="cat-name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className={INPUT_CLS}
              placeholder="e.g. Grocery, Pharmacy, Bakery"
            />
          </div>
          <div>
            <label htmlFor="cat-sort" className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Sort order</label>
            <input id="cat-sort" type="number" min="0" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className={INPUT_CLS} />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Saving…' : modal?.mode === 'edit' ? 'Save Changes' : 'Add Vertical'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        open={!!deleteTarget}
        onOpenChange={v => !v && closeDelete()}
        title="Delete Vertical"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">Are you sure?</p>
              <p>
                You are about to permanently delete the <strong>{deleteTarget?.name}</strong> vertical.
                This action cannot be undone. Any stores still assigned to this vertical must be
                re-assigned before deletion is allowed.
              </p>
            </div>
          </div>

          {deleteError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-700">
              <X size={14} className="shrink-0 mt-0.5" />
              <p>{deleteError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={closeDelete} disabled={deleteLoading}>
              Cancel
            </Button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {deleteLoading ? 'Deleting…' : 'Delete Vertical'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
