"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
  Filter,
} from "lucide-react";

const ALL_ORDERS = [
  { id: "GM7834921", customer: "Rahul Sharma", phone: "+91 98765 43210", items: 3, products: "Atta, Milk, Noodles", total: 456, status: "Delivered", time: "10 min ago", address: "101, Connaught Place, Delhi" },
  { id: "GM7834920", customer: "Priya Verma", phone: "+91 87654 32109", items: 1, products: "Dettol Soap", total: 115, status: "In Transit", time: "22 min ago", address: "45, Rajouri Garden, Delhi" },
  { id: "GM7834919", customer: "Amit Singh", phone: "+91 76543 21098", items: 5, products: "Biscuits, Tea, Oil...", total: 892, status: "Processing", time: "35 min ago", address: "22, Karol Bagh, Delhi" },
  { id: "GM7834918", customer: "Sunita Rao", phone: "+91 65432 10987", items: 2, products: "Butter, Milk", total: 330, status: "Delivered", time: "1 hr ago", address: "78, Lajpat Nagar, Delhi" },
  { id: "GM7834917", customer: "Vikram Patel", phone: "+91 54321 09876", items: 4, products: "Soap, Shampoo...", total: 670, status: "Cancelled", time: "2 hr ago", address: "12, Dwarka Sector 7, Delhi" },
  { id: "GM7834916", customer: "Kavita Joshi", phone: "+91 43210 98765", items: 2, products: "Atta, Dal", total: 245, status: "Delivered", time: "3 hr ago", address: "55, Noida Sector 18" },
  { id: "GM7834915", customer: "Deepak Gupta", phone: "+91 32109 87654", items: 6, products: "Grocery bundle", total: 1240, status: "Delivered", time: "5 hr ago", address: "9, Rohini Sector 3, Delhi" },
  { id: "GM7834914", customer: "Meera Pillai", phone: "+91 21098 76543", items: 1, products: "Colgate MaxFresh", total: 99, status: "Processing", time: "6 hr ago", address: "33, Janakpuri, Delhi" },
  { id: "GM7834913", customer: "Suresh Kumar", phone: "+91 11234 56789", items: 3, products: "Noodles, Bournvita...", total: 311, status: "In Transit", time: "7 hr ago", address: "14, Vaishali, Ghaziabad" },
  { id: "GM7834912", customer: "Anita Sharma", phone: "+91 99887 76655", items: 2, products: "Dettol, Vaseline", total: 303, status: "Delivered", time: "Yesterday", address: "7, Green Park, Delhi" },
];

const ITEMS_PER_PAGE = 6;

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Delivered: { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
  "In Transit": { color: "text-blue-400", bg: "bg-blue-500/10", icon: Truck },
  Processing: { color: "text-amber-400", bg: "bg-amber-500/10", icon: Clock },
  Cancelled: { color: "text-red-400", bg: "bg-red-500/10", icon: XCircle },
};

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<typeof ALL_ORDERS[0] | null>(null);

  const filtered = ALL_ORDERS.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const statusCounts = {
    All: ALL_ORDERS.length,
    Processing: ALL_ORDERS.filter((o) => o.status === "Processing").length,
    "In Transit": ALL_ORDERS.filter((o) => o.status === "In Transit").length,
    Delivered: ALL_ORDERS.filter((o) => o.status === "Delivered").length,
    Cancelled: ALL_ORDERS.filter((o) => o.status === "Cancelled").length,
  };

  const totalRevenue = ALL_ORDERS.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Orders</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Track and manage all customer orders</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-right">
          <p className="text-[11px] text-neutral-500 font-medium">Total Revenue</p>
          <p className="text-lg font-black text-emerald-400">₹{totalRevenue.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === status
                ? "bg-emerald-600 text-neutral-900 dark:text-white shadow-lg shadow-emerald-900/40"
                : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-neutral-600 hover:text-neutral-900 dark:text-white"
            }`}
          >
            {status}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${statusFilter === status ? "bg-white/20" : "bg-neutral-100 dark:bg-neutral-800"}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        {/* Search */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:border-emerald-600"
            />
          </div>
          <span className="text-xs text-neutral-500">{filtered.length} orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="text-left px-5 py-3 font-semibold text-neutral-500">Order ID</th>
                <th className="text-left px-3 py-3 font-semibold text-neutral-500">Customer</th>
                <th className="text-left px-3 py-3 font-semibold text-neutral-500 hidden md:table-cell">Products</th>
                <th className="text-left px-3 py-3 font-semibold text-neutral-500">Total</th>
                <th className="text-left px-3 py-3 font-semibold text-neutral-500">Status</th>
                <th className="text-left px-3 py-3 font-semibold text-neutral-500 hidden sm:table-cell">Time</th>
                <th className="text-left px-3 py-3 font-semibold text-neutral-500">View</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((order) => {
                const cfg = statusConfig[order.status];
                const StatusIcon = cfg.icon;
                return (
                  <tr key={order.id} className="border-b border-neutral-200 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-emerald-400">{order.id}</td>
                    <td className="px-3 py-3">
                      <p className="font-bold text-neutral-900 dark:text-white">{order.customer}</p>
                      <p className="text-neutral-500 text-[10px]">{order.items} items</p>
                    </td>
                    <td className="px-3 py-3 text-neutral-500 dark:text-neutral-400 hidden md:table-cell max-w-[140px] truncate">{order.products}</td>
                    <td className="px-3 py-3 font-bold text-neutral-900 dark:text-white">₹{order.total}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon size={10} />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-neutral-500 hidden sm:table-cell">{order.time}</td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-neutral-500 hover:text-emerald-400 transition-colors"
                      >
                        <Eye size={15} />
                      </button>
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
              className="w-8 h-8 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
              className="w-8 h-8 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-neutral-900 dark:text-white">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-neutral-500 hover:text-neutral-900 dark:text-white transition-colors text-xl font-bold">×</button>
            </div>
            {(() => {
              const cfg = statusConfig[selectedOrder.status];
              const StatusIcon = cfg.icon;
              return (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Order ID</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedOrder.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Customer</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{selectedOrder.customer}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Phone</span>
                    <span className="text-neutral-900 dark:text-white">{selectedOrder.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Products</span>
                    <span className="text-neutral-900 dark:text-white text-right max-w-[60%]">{selectedOrder.products}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Total</span>
                    <span className="font-black text-neutral-900 dark:text-white text-base">₹{selectedOrder.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Address</span>
                    <span className="text-neutral-900 dark:text-white text-right max-w-[60%] text-xs">{selectedOrder.address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Status</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-xs ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon size={10} />
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              );
            })()}
            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold rounded-xl transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
