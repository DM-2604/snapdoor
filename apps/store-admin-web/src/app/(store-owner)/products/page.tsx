'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Plus, Trash2, ChevronLeft, ChevronRight,
  Package, TrendingUp, AlertCircle, RefreshCw,
  ChevronDown, ChevronUp, Edit2, X, Check, Layers,
} from 'lucide-react';
import { storeOwnerApi } from '@/lib/api';

const ITEMS_PER_PAGE = 10;

function getProductStatus(product: any) {
  if (!product.isActive) return 'Inactive';
  const stock = product.variants?.[0]?.inventory?.quantity ?? 0;
  if (stock === 0) return 'Out of Stock';
  if (stock < 10) return 'Low Stock';
  return 'Active';
}

const statusStyles: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-500/10',
  Inactive: 'text-neutral-400 bg-neutral-500/10',
  'Out of Stock': 'text-red-400 bg-red-500/10',
  'Low Stock': 'text-amber-400 bg-amber-500/10',
};

// ── Add Product Form ──────────────────────────────────────────────────────────

const EMPTY_PRODUCT = { name: '', storeCategoryId: '', mrp: '', sellingPrice: '', stock: '', lowStockThreshold: '5', variantName: 'Standard', sku: '' };

function AddProductModal({ onClose, categories }: {
  onClose: () => void;
  categories: { businessCategory: any; myCategories: any[] } | undefined;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const mutation = useMutation({
    mutationFn: (dto: any) => storeOwnerApi.createProduct(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mrp || !form.sellingPrice) return;
    mutation.mutate({
      name: form.name.trim(),
      mrp: Number(form.mrp),
      sellingPrice: Number(form.sellingPrice),
      initialStockQuantity: Number(form.stock) || 0,
      lowStockThreshold: Number(form.lowStockThreshold) || 5,
      variantName: form.variantName.trim() || 'Standard',
      sku: form.sku.trim() || undefined,
      storeCategoryId: form.storeCategoryId || undefined,
    });
  };

  const businessCategory = categories?.businessCategory;
  const myCategories = categories?.myCategories ?? [];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-black text-neutral-900 dark:text-white">Add New Product</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500">Product Name *</label>
            <input required value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Amul Butter 100g"
              className="w-full px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:border-emerald-600 transition-colors" />
          </div>

          {/* Variant name + SKU */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">Default Variant Name</label>
              <input value={form.variantName} onChange={(e) => set('variantName', e.target.value)}
                placeholder="e.g. 100g, 1kg, Standard"
                className="w-full px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:border-emerald-600 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">SKU (optional)</label>
              <input value={form.sku} onChange={(e) => set('sku', e.target.value)}
                placeholder="e.g. AMB-100G"
                className="w-full px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:border-emerald-600 transition-colors" />
            </div>
          </div>

          {/* MRP + Selling Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">MRP (₹) *</label>
              <input required type="number" min="0" step="0.01" value={form.mrp} onChange={(e) => set('mrp', e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:border-emerald-600 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">Selling Price (₹) *</label>
              <input required type="number" min="0" step="0.01" value={form.sellingPrice} onChange={(e) => set('sellingPrice', e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:border-emerald-600 transition-colors" />
            </div>
          </div>

          {/* Stock + Low stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">Initial Stock</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:border-emerald-600 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">Low Stock Alert At</label>
              <input type="number" min="0" value={form.lowStockThreshold} onChange={(e) => set('lowStockThreshold', e.target.value)}
                placeholder="5"
                className="w-full px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:border-emerald-600 transition-colors" />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500">Category</label>
            {!businessCategory ? (
              <p className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3">
                No categories set up. <Link href="/categories" className="underline font-bold">Set up categories first →</Link>
              </p>
            ) : (
              <select value={form.storeCategoryId} onChange={(e) => set('storeCategoryId', e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white outline-none focus:border-emerald-600 transition-colors">
                <option value="">— Use business default ({businessCategory.name}) —</option>
                <optgroup label={`── ${businessCategory.name} ──`}>
                  {myCategories.filter((c) => c.parentCategoryId === businessCategory.id).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
                {myCategories.filter((c) => c.parentCategoryId !== businessCategory.id).length > 0 && (
                  <optgroup label="── Sub-categories ──">
                    {myCategories.filter((c) => c.parentCategoryId !== businessCategory.id).map((c) => (
                      <option key={c.id} value={c.id}>&nbsp;&nbsp;{c.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            )}
          </div>

          {mutation.isError && (
            <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} /> Failed to create product. Check all fields and try again.</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-neutral-300 dark:border-neutral-700 text-neutral-500 font-bold rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50">
              {mutation.isPending ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Variant Panel (inline expanded row) ──────────────────────────────────────

function VariantPanel({ product }: { product: any }) {
  const queryClient = useQueryClient();
  const productId = product.id;
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newVariant, setNewVariant] = useState({ name: '', mrp: '', sellingPrice: '', sku: '', stock: '0' });
  const [editForm, setEditForm] = useState<any>({});

  const { data: detail, isLoading } = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: () => storeOwnerApi.getProduct(productId),
  });

  const variants: any[] = (detail as any)?.variants ?? product.variants ?? [];

  const createVariantMutation = useMutation({
    mutationFn: (dto: any) => storeOwnerApi.createVariant(productId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-detail', productId] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      setNewVariant({ name: '', mrp: '', sellingPrice: '', sku: '', stock: '0' });
      setShowAddForm(false);
    },
  });

  const updateVariantMutation = useMutation({
    mutationFn: ({ variantId, dto }: { variantId: string; dto: any }) =>
      storeOwnerApi.updateVariant(productId, variantId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-detail', productId] });
      setEditingId(null);
    },
  });

  const deleteVariantMutation = useMutation({
    mutationFn: (variantId: string) => storeOwnerApi.deleteVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-detail', productId] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
    },
  });

  const startEdit = (v: any) => {
    setEditingId(v.id);
    setEditForm({ name: v.variantName, mrp: String(v.priceOverride ?? ''), sellingPrice: String(v.priceOverride ?? ''), sku: v.sku ?? '' });
  };

  return (
    <div className="px-6 pb-5 pt-2 bg-neutral-50 dark:bg-neutral-950/40 border-t border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
          <Layers size={12} /> Variants ({variants.length})
        </p>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors">
          <Plus size={12} /> Add Variant
        </button>
      </div>

      {isLoading && <p className="text-xs text-neutral-400">Loading variants…</p>}

      <div className="space-y-2">
        {variants.map((v: any) => (
          <div key={v.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3">
            {editingId === v.id ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <input value={editForm.name} onChange={(e) => setEditForm((f: any) => ({ ...f, name: e.target.value }))}
                    placeholder="Name" className="px-2 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-emerald-600 dark:text-white" />
                  <input type="number" value={editForm.mrp} onChange={(e) => setEditForm((f: any) => ({ ...f, mrp: e.target.value }))}
                    placeholder="MRP ₹" className="px-2 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-emerald-600 dark:text-white" />
                  <input type="number" value={editForm.sellingPrice} onChange={(e) => setEditForm((f: any) => ({ ...f, sellingPrice: e.target.value }))}
                    placeholder="Selling ₹" className="px-2 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-emerald-600 dark:text-white" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateVariantMutation.mutate({ variantId: v.id, dto: { name: editForm.name, mrp: Number(editForm.mrp), sellingPrice: Number(editForm.sellingPrice) } })}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500 transition-colors">
                    <Check size={11} /> Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">{v.variantName}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-neutral-500">MRP: ₹{v.priceOverride ?? 'N/A'}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Stock: {v.inventory?.quantity ?? 0}
                    </span>
                    {v.sku && <span className="text-xs text-neutral-400 font-mono">SKU: {v.sku}</span>}
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${v.isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-neutral-400 bg-neutral-500/10'}`}>
                      {v.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(v)} className="p-1.5 text-neutral-400 hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete variant "${v.variantName}"?`)) deleteVariantMutation.mutate(v.id); }}
                    disabled={variants.length <= 1}
                    title={variants.length <= 1 ? 'Cannot delete the only variant' : 'Delete variant'}
                    className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Variant Form */}
      {showAddForm && (
        <div className="mt-3 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700/50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">New Variant</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={newVariant.name} onChange={(e) => setNewVariant((f) => ({ ...f, name: e.target.value }))}
              placeholder="Variant name (e.g. 500g)" required
              className="px-2.5 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-emerald-600 dark:text-white" />
            <input value={newVariant.sku} onChange={(e) => setNewVariant((f) => ({ ...f, sku: e.target.value }))}
              placeholder="SKU (optional)"
              className="px-2.5 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-emerald-600 dark:text-white" />
            <input type="number" min="0" value={newVariant.mrp} onChange={(e) => setNewVariant((f) => ({ ...f, mrp: e.target.value }))}
              placeholder="MRP (₹) *" required
              className="px-2.5 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-emerald-600 dark:text-white" />
            <input type="number" min="0" value={newVariant.sellingPrice} onChange={(e) => setNewVariant((f) => ({ ...f, sellingPrice: e.target.value }))}
              placeholder="Selling Price (₹) *" required
              className="px-2.5 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-emerald-600 dark:text-white" />
            <input type="number" min="0" value={newVariant.stock} onChange={(e) => setNewVariant((f) => ({ ...f, stock: e.target.value }))}
              placeholder="Initial stock"
              className="px-2.5 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs outline-none focus:border-emerald-600 dark:text-white" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!newVariant.name || !newVariant.mrp || !newVariant.sellingPrice) return;
                createVariantMutation.mutate({
                  name: newVariant.name, mrp: Number(newVariant.mrp),
                  sellingPrice: Number(newVariant.sellingPrice),
                  sku: newVariant.sku || undefined,
                  initialStockQuantity: Number(newVariant.stock) || 0,
                });
              }}
              disabled={createVariantMutation.isPending}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50">
              {createVariantMutation.isPending ? 'Adding…' : 'Add Variant'}
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Products Page ────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['store-products', currentPage, search],
    queryFn: () => storeOwnerApi.listProducts({ page: currentPage, limit: ITEMS_PER_PAGE, search: search || undefined }),
    placeholderData: (prev) => prev,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['store-categories'],
    queryFn: () => storeOwnerApi.listCategories(),
    staleTime: 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => storeOwnerApi.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['store-products'] }),
  });

  const products: any[] = (data as any)?.items ?? [];
  const totalItems = (data as any)?.total ?? 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  const toggleExpand = (id: string) => setExpandedProductId((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Products</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Manage your product catalog and variants</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-600/30">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: totalItems, icon: Package, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Active', value: products.filter((p) => p.isActive).length, icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Out of Stock', value: products.filter((p) => getProductStatus(p) === 'Out of Stock').length, icon: AlertCircle, color: 'text-red-400 bg-red-500/10' },
          { label: 'Low Stock', value: products.filter((p) => getProductStatus(p) === 'Low Stock').length, icon: AlertCircle, color: 'text-amber-400 bg-amber-500/10' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}><Icon size={18} /></div>
              <p className="text-2xl font-black text-neutral-900 dark:text-white">{isLoading ? '—' : s.value}</p>
              <p className="text-xs text-neutral-500 font-medium">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        {/* Search */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setCurrentPage(1); }} className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:border-emerald-600 transition-colors"
            />
          </form>
          {search && (
            <button onClick={() => { setSearch(''); setSearchInput(''); setCurrentPage(1); }}
              className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin text-emerald-500" size={24} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto">
              <Package size={28} className="text-neutral-400" />
            </div>
            <p className="font-bold text-neutral-500">{search ? 'No products found' : 'No products yet'}</p>
            <button onClick={() => setShowAddModal(true)} className="text-sm font-bold text-emerald-600 hover:underline">Add your first product →</button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {products.map((product: any) => {
              const status = getProductStatus(product);
              const isExpanded = expandedProductId === product.id;
              const stock = product.variants?.[0]?.inventory?.quantity ?? 0;
              return (
                <div key={product.id}>
                  <div className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                    {/* Product icon */}
                    <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-xl shrink-0 border border-neutral-200 dark:border-neutral-700">
                      📦
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{product.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-neutral-500">{product.category?.name ?? '—'}</span>
                        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">₹{product.basePrice}</span>
                        <span className="text-xs text-neutral-400">{product.variants?.length ?? 0} variant{product.variants?.length !== 1 ? 's' : ''}</span>
                        <span className="text-xs text-neutral-400">Stock: {stock}</span>
                      </div>
                    </div>
                    {/* Status */}
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full hidden sm:inline-flex items-center ${statusStyles[status] ?? 'text-neutral-400 bg-neutral-500/10'}`}>
                      {status}
                    </span>
                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleExpand(product.id)}
                        title="Manage variants"
                        className="p-2 text-neutral-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this product and all its variants?')) deleteMutation.mutate(product.id); }}
                        className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  {/* Inline Variant Panel */}
                  {isExpanded && <VariantPanel product={product} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-xs text-neutral-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const page = totalPages <= 7 ? i + 1 : i === 0 ? 1 : i === 6 ? totalPages : currentPage - 3 + i;
                return (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${page === currentPage ? 'bg-emerald-600 text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
                    {page}
                  </button>
                );
              })}
              <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddProductModal onClose={() => setShowAddModal(false)} categories={categoriesData} />
      )}
    </div>
  );
}
