"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Star,
  Package,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const INITIAL_PRODUCTS = [
  { id: 1, emoji: "🌾", name: "Aashirvaad Whole Wheat Atta", category: "Grocery", price: 265, stock: 48, rating: 4.8, status: "Active" },
  { id: 2, emoji: "🥛", name: "Amul Gold Full Cream Milk (1L)", category: "Dairy", price: 68, stock: 120, rating: 4.7, status: "Active" },
  { id: 3, emoji: "🍜", name: "Maggi 2-Minute Noodles (280g)", category: "Grocery", price: 48, stock: 0, rating: 4.4, status: "Out of Stock" },
  { id: 4, emoji: "🧼", name: "Dettol Original Soap (125g)", category: "Personal Care", price: 48, stock: 72, rating: 4.5, status: "Active" },
  { id: 5, emoji: "🦷", name: "Colgate MaxFresh Toothpaste (150g)", category: "Personal Care", price: 99, stock: 35, rating: 4.3, status: "Active" },
  { id: 6, emoji: "🍪", name: "Britannia Marie Gold Biscuits (250g)", category: "Grocery", price: 35, stock: 8, rating: 4.5, status: "Low Stock" },
  { id: 7, emoji: "🧈", name: "Amul Butter (100g)", category: "Dairy", price: 55, stock: 65, rating: 4.7, status: "Active" },
  { id: 8, emoji: "🫧", name: "Surf Excel Matic Liquid (1kg)", category: "Household", price: 359, stock: 0, rating: 4.6, status: "Out of Stock" },
  { id: 9, emoji: "🍾", name: "Amul Taaza Toned Milk (1L)", category: "Dairy", price: 56, stock: 90, rating: 4.6, status: "Active" },
  { id: 10, emoji: "🌱", name: "Organic Toor Dal (1kg)", category: "Grocery", price: 120, stock: 22, rating: 4.4, status: "Active" },
  { id: 11, emoji: "🧴", name: "Dettol Antiseptic Liquid (250ml)", category: "Personal Care", price: 193, stock: 18, rating: 4.7, status: "Active" },
  { id: 12, emoji: "☕", name: "Bournvita Health Drink (500g)", category: "Grocery", price: 215, stock: 0, rating: 4.7, status: "Out of Stock" },
];

const ITEMS_PER_PAGE = 8;

const statusConfig: Record<string, { color: string; bg: string }> = {
  Active: { color: "text-emerald-400", bg: "bg-emerald-500/10" },
  "Out of Stock": { color: "text-red-400", bg: "bg-red-500/10" },
  "Low Stock": { color: "text-amber-400", bg: "bg-amber-500/10" },
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "Grocery", price: "", stock: "", emoji: "📦" });

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const id = products.length + 1;
    setProducts((prev) => [
      ...prev,
      {
        id,
        emoji: newProduct.emoji,
        name: newProduct.name,
        category: newProduct.category,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        rating: 0,
        status: Number(newProduct.stock) === 0 ? "Out of Stock" : "Active",
      },
    ]);
    setNewProduct({ name: "", category: "Grocery", price: "", stock: "", emoji: "📦" });
    setShowAddModal(false);
  };

  const summaryStats = {
    total: products.length,
    active: products.filter((p) => p.status === "Active").length,
    outOfStock: products.filter((p) => p.status === "Out of Stock").length,
    lowStock: products.filter((p) => p.status === "Low Stock").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Products</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Manage your product catalog</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-600/30 dark:shadow-emerald-900/40"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: summaryStats.total, icon: Package, color: "text-blue-400 bg-blue-500/10" },
          { label: "Active", value: summaryStats.active, icon: TrendingUp, color: "text-emerald-400 bg-emerald-500/10" },
          { label: "Out of Stock", value: summaryStats.outOfStock, icon: AlertCircle, color: "text-red-400 bg-red-500/10" },
          { label: "Low Stock", value: summaryStats.lowStock, icon: AlertCircle, color: "text-amber-400 bg-amber-500/10" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-black text-neutral-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-neutral-500 font-medium">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:border-emerald-600 transition-colors"
            />
          </div>
          <span className="text-xs text-neutral-500">{filtered.length} products</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="text-left px-5 py-3 font-semibold text-neutral-500">Product</th>
                <th className="text-left px-3 py-3 font-semibold text-neutral-500 hidden md:table-cell">Category</th>
                <th className="text-left px-3 py-3 font-semibold text-neutral-500">Price</th>
                <th className="text-left px-3 py-3 font-semibold text-neutral-500 hidden sm:table-cell">Stock</th>
                <th className="text-left px-3 py-3 font-semibold text-neutral-500 hidden lg:table-cell">Rating</th>
                <th className="text-left px-3 py-3 font-semibold text-neutral-500">Status</th>
                <th className="text-left px-3 py-3 font-semibold text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product) => {
                const cfg = statusConfig[product.status];
                return (
                  <tr key={product.id} className="border-b border-neutral-200 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-xl shrink-0">
                          {product.emoji}
                        </div>
                        <span className="font-bold text-neutral-900 dark:text-white line-clamp-1 max-w-[160px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-neutral-500 dark:text-neutral-400 hidden md:table-cell">{product.category}</td>
                    <td className="px-3 py-3 font-bold text-neutral-900 dark:text-white">₹{product.price}</td>
                    <td className="px-3 py-3 text-neutral-500 dark:text-neutral-400 hidden sm:table-cell">
                      <span className={product.stock === 0 ? "text-red-400" : product.stock < 10 ? "text-amber-400" : "text-neutral-500 dark:text-neutral-400"}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      {product.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          <span className="font-bold text-neutral-900 dark:text-white">{product.rating}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-600">No ratings</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${cfg.bg} ${cfg.color}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-neutral-500 hover:text-emerald-400 transition-colors" title="View">
                          <Eye size={15} />
                        </button>
                        <button className="text-neutral-500 hover:text-blue-400 transition-colors" title="Edit">
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-neutral-500 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-neutral-200 dark:border-neutral-800">
          <span className="text-xs text-neutral-500">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:border-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${
                  page === currentPage ? "bg-emerald-600 text-neutral-900 dark:text-white" : "border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:text-white"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:border-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-black text-neutral-900 dark:text-white mb-6">Add New Product</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Product Emoji</label>
                <input
                  type="text"
                  value={newProduct.emoji}
                  onChange={(e) => setNewProduct((p) => ({ ...p, emoji: e.target.value }))}
                  className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white outline-none focus:border-emerald-600"
                  maxLength={2}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Amul Butter 100g"
                  className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-600 outline-none focus:border-emerald-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white outline-none focus:border-emerald-600"
                  >
                    {["Grocery", "Dairy", "Personal Care", "Household", "Electronics", "Stationery"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-600 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Stock Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-600 outline-none focus:border-emerald-600"
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
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-900 dark:text-white font-bold rounded-xl transition-colors text-sm"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
