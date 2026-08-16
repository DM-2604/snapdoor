'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Tag,
  Plus,
  Trash2,
  ChevronRight,
  RefreshCw,
  FolderOpen,
  Folder,
  AlertCircle,
} from 'lucide-react';
import { storeOwnerApi } from '@/lib/api';

type MyCategory = {
  id: string;
  name: string;
  parentCategoryId: string | null;
  storeId: string;
  isActive: boolean;
  createdAt: string;
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addParentId, setAddParentId] = useState<string>('');
  const [addParentName, setAddParentName] = useState<string>('');
  const [newCatName, setNewCatName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MyCategory | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['store-categories'],
    queryFn: () => storeOwnerApi.listCategories(),
    staleTime: 30 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (dto: { name: string; parentCategoryId: string }) =>
      storeOwnerApi.createCategory(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
      setShowAddModal(false);
      setNewCatName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => storeOwnerApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
      setDeleteTarget(null);
    },
  });

  const businessCategory = data?.businessCategory;
  const myCategories: MyCategory[] = data?.myCategories ?? [];

  // Group myCategories by parentCategoryId
  const grouped = myCategories.reduce<Record<string, MyCategory[]>>((acc, cat) => {
    const key = cat.parentCategoryId ?? 'root';
    if (!acc[key]) acc[key] = [];
    acc[key].push(cat);
    return acc;
  }, {});

  const openAddModal = (parentId: string, parentName: string) => {
    setAddParentId(parentId);
    setAddParentName(parentName);
    setNewCatName('');
    setShowAddModal(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !addParentId) return;
    createMutation.mutate({ name: newCatName.trim(), parentCategoryId: addParentId });
  };

  /** Recursive renderer for a category and its children */
  const renderCategory = (cat: MyCategory, depth = 0): React.ReactNode => {
    const children = grouped[cat.id] ?? [];
    return (
      <div key={cat.id}>
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors group ${
            depth > 0 ? 'ml-6 border-l-2 border-neutral-200 dark:border-neutral-700 pl-6 rounded-l-none' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            {children.length > 0 ? (
              <FolderOpen size={16} className="text-amber-400 shrink-0" />
            ) : (
              <Folder size={16} className="text-neutral-400 shrink-0" />
            )}
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">{cat.name}</span>
            <span className="text-xs text-neutral-400 hidden sm:inline">
              {children.length} sub-{children.length === 1 ? 'category' : 'categories'}
            </span>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => openAddModal(cat.id, cat.name)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
            >
              <Plus size={12} /> Add sub
            </button>
            <button
              onClick={() => setDeleteTarget(cat)}
              className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        {children.map((child) => renderCategory(child, depth + 1))}
      </div>
    );
  };

  // Top-level store categories: those whose parent is the business vertical OR parentCategoryId is null
  // (covers categories created before strict parentCategoryId enforcement)
  const topLevel = [
    ...(businessCategory ? (grouped[businessCategory.id] ?? []) : []),
    ...(grouped['root'] ?? []),   // parentCategoryId === null
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Categories</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Organise your products into categories under your business vertical
          </p>
        </div>
        {businessCategory && (
          <button
            onClick={() => openAddModal(businessCategory.id, businessCategory.name)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-600/30 dark:shadow-emerald-900/40"
          >
            <Plus size={16} /> Add Category
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="animate-spin text-emerald-500" size={24} />
        </div>
      ) : (
        <>
          {/* Business Vertical (read-only) */}
          {businessCategory && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-emerald-50 dark:bg-emerald-500/5">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                  <Tag size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Business Vertical</p>
                  <p className="text-base font-black text-neutral-900 dark:text-white">{businessCategory.name}</p>
                </div>
                <span className="ml-auto text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-full">Read-only</span>
              </div>

              {/* Category tree */}
              <div className="p-4 space-y-1">
                {topLevel.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto">
                      <Folder size={24} className="text-neutral-400" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-500">No categories yet</p>
                    <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                      Create your first product category under <strong>{businessCategory.name}</strong> to organise your products.
                    </p>
                    <button
                      onClick={() => openAddModal(businessCategory.id, businessCategory.name)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors mt-2"
                    >
                      <Plus size={14} /> Create First Category
                    </button>
                  </div>
                ) : (
                  topLevel.map((cat) => renderCategory(cat))
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
              <p className="text-2xl font-black text-neutral-900 dark:text-white">{myCategories.length}</p>
              <p className="text-xs text-neutral-500 font-medium mt-1">Total categories created</p>
            </div>
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
              <p className="text-2xl font-black text-neutral-900 dark:text-white">{topLevel.length}</p>
              <p className="text-xs text-neutral-500 font-medium mt-1">Top-level categories</p>
            </div>
          </div>
        </>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-black text-neutral-900 dark:text-white mb-1">Add Category</h2>
            <p className="text-sm text-neutral-500 mb-6">
              Under: <span className="font-bold text-emerald-500">{addParentName}</span>
            </p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Category Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Dairy, Fruits, Organic Milk"
                  className="w-full px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:border-emerald-600 transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 font-bold rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
              {createMutation.isError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} /> Failed to create category. Please try again.
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                <Trash2 size={18} />
              </div>
              <div>
                <h2 className="text-base font-black text-neutral-900 dark:text-white">Delete Category?</h2>
                <p className="text-sm text-neutral-500">"{deleteTarget.name}"</p>
              </div>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3">
              ⚠️ All products in this category will be moved to its parent category. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-neutral-300 dark:border-neutral-700 text-neutral-500 font-bold rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
