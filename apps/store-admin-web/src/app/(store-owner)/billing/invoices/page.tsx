"use client";
// app/(store-owner)/billing/invoices/page.tsx
// Sales invoice list with pagination and stats.
// Note: backend API supports page/limit only — no channel/date filtering yet.

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  RefreshCw,
  Receipt,
  TrendingUp,
  IndianRupee,
  FileText,
  ChevronLeft,
  ChevronRight,
  Printer,
} from "lucide-react";
import { storeOwnerApi } from "@/lib/api";
import { InvoiceReceiptModal, type InvoiceData } from "@/components/billing/InvoiceReceiptModal";

const ITEMS_PER_PAGE = 15;

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ChannelBadge({ channel }: { channel: string }) {
  const styles: Record<string, string> = {
    POS: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
    APP: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${styles[channel] ?? "bg-neutral-100 text-neutral-500"}`}>
      {channel}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <p className="text-[11px] text-neutral-500 font-medium">{label}</p>
        <p className="font-black text-neutral-900 dark:text-white text-sm">{value}</p>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

  // API returns { items, total, page, limit }
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["invoices", page],
    queryFn: () =>
      storeOwnerApi.listSalesInvoices({ page, limit: ITEMS_PER_PAGE }) as Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
      }>,
    staleTime: 30_000,
  });

  const invoices = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

  // Compute stats from current page
  const pageRevenue = invoices.reduce((s, i) => s + Number(i.totalAmount ?? 0), 0);
  const pageGst = invoices.reduce((s, i) => s + Number(i.gstAmount ?? 0), 0);

  const openInvoice = (inv: any) =>
    setSelectedInvoice({
      invoiceNumber: inv.invoiceNumber,
      storeName: inv.order?.store?.name ?? "Store",
      storeAddress: inv.order?.store?.address ?? null,
      customerName: inv.order?.customerContact?.name ?? null,
      items: (inv.order?.items ?? []).map((item: any) => ({
        name: item.productNameSnapshot,
        quantity: item.quantity,
        unitPrice: Number(item.unitPriceSnapshot),
        gstRatePercent: Number(item.gstRatePercentSnapshot ?? 0),
      })),
      subtotalAmount: Number(inv.order?.subtotal ?? inv.totalAmount),
      gstAmount: Number(inv.gstAmount ?? 0),
      discountAmount: Number(inv.order?.discountAmount ?? 0),
      totalAmount: Number(inv.totalAmount),
      paymentMethod: inv.order?.paymentMethod ?? "—",
      createdAt: inv.issuedAt ?? inv.createdAt,
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Invoices</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Sales tax receipts for completed orders</p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 text-neutral-500 hover:text-emerald-500 transition-colors"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Invoices (this page)" value={total.toString()} icon={FileText} color="bg-blue-500" />
        <StatCard label="Revenue (this page)" value={formatCurrency(pageRevenue)} icon={IndianRupee} color="bg-emerald-500" />
        <StatCard label="GST (this page)" value={formatCurrency(pageGst)} icon={TrendingUp} color="bg-purple-500" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-emerald-500" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <Receipt size={32} className="mb-2 opacity-30" />
            <p className="text-sm">No invoices found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <th className="text-left px-5 py-3 font-semibold text-neutral-500">Invoice #</th>
                    <th className="text-left px-3 py-3 font-semibold text-neutral-500">Order #</th>
                    <th className="text-left px-3 py-3 font-semibold text-neutral-500">Channel</th>
                    <th className="text-left px-3 py-3 font-semibold text-neutral-500">Date</th>
                    <th className="text-left px-3 py-3 font-semibold text-neutral-500 hidden sm:table-cell">Customer</th>
                    <th className="text-right px-3 py-3 font-semibold text-neutral-500 hidden md:table-cell">GST</th>
                    <th className="text-right px-3 py-3 font-semibold text-neutral-500">Total</th>
                    <th className="text-left px-3 py-3 font-semibold text-neutral-500">Payment</th>
                    <th className="text-left px-3 py-3 font-semibold text-neutral-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv: any) => (
                    <tr
                      key={inv.id}
                      className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="px-5 py-3 font-mono font-bold text-emerald-500">{inv.invoiceNumber}</td>
                      <td className="px-3 py-3 font-mono text-neutral-500">{inv.order?.orderNumber ?? "—"}</td>
                      <td className="px-3 py-3">
                        <ChannelBadge channel={inv.order?.channel ?? "APP"} />
                      </td>
                      <td className="px-3 py-3 text-neutral-500">{formatDate(inv.issuedAt ?? inv.createdAt)}</td>
                      <td className="px-3 py-3 text-neutral-700 dark:text-neutral-300 hidden sm:table-cell">
                        {inv.order?.customerContact?.name ?? <span className="text-neutral-400">Walk-in</span>}
                      </td>
                      <td className="px-3 py-3 text-right text-blue-600 dark:text-blue-400 hidden md:table-cell">
                        {Number(inv.gstAmount ?? 0) > 0 ? `₹${Number(inv.gstAmount).toFixed(2)}` : "—"}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-neutral-900 dark:text-white">
                        ₹{Number(inv.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-neutral-500">
                        {inv.order?.paymentMethod ?? "—"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openInvoice(inv)}
                            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => { openInvoice(inv); setTimeout(() => window.print(), 400); }}
                            title="Print invoice"
                            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                          >
                            <Printer size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-neutral-200 dark:border-neutral-800">
              <span className="text-xs text-neutral-500">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} of {total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 disabled:opacity-40 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i;
                  if (p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${
                        p === page
                          ? "bg-emerald-600 text-white"
                          : "border border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 disabled:opacity-40 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedInvoice && (
        <InvoiceReceiptModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
}
