"use client";
// components/billing/InvoiceReceiptModal.tsx
// Printable invoice receipt — shown after POS sale or when viewing invoice list.
// Hides action buttons in print media via CSS.

import React from "react";
import { X, Printer } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InvoiceData {
  invoiceNumber: string;
  storeName: string;
  storeAddress: string | null;
  storeGstNumber?: string | null;
  customerName?: string | null;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    gstRatePercent: number;
  }>;
  subtotalAmount: number;
  gstAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
}

interface Props {
  invoice: InvoiceData;
  onClose: () => void;
}

function fmt(dt: string) {
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function InvoiceReceiptModal({ invoice, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Non-print actions header */}
        <div className="no-print flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <span className="font-bold text-sm text-neutral-800 dark:text-white">Invoice Receipt</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Printer size={13} /> Print
            </button>
            <button onClick={onClose} className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable receipt */}
        <div id="printable-invoice" className="px-6 py-5 space-y-4 font-mono text-sm text-neutral-900">
          {/* Store header */}
          <div className="text-center space-y-0.5">
            <h2 className="font-black text-base uppercase tracking-wide">{invoice.storeName}</h2>
            {invoice.storeAddress && <p className="text-xs text-neutral-500">{invoice.storeAddress}</p>}
            {invoice.storeGstNumber && (
              <p className="text-xs text-neutral-500">GSTIN: {invoice.storeGstNumber}</p>
            )}
          </div>

          <div className="border-t border-dashed border-neutral-300" />

          {/* Invoice meta */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-500">Invoice</span>
              <span className="font-bold">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Date</span>
              <span>{fmt(invoice.createdAt)}</span>
            </div>
            {invoice.customerName && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Customer</span>
                <span>{invoice.customerName}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-neutral-300" />

          {/* Items */}
          <table className="w-full text-xs">
            <thead>
              <tr className="text-neutral-500 border-b border-neutral-200">
                <th className="text-left pb-1 font-semibold">Item</th>
                <th className="text-center pb-1 font-semibold w-8">Qty</th>
                <th className="text-right pb-1 font-semibold">Price</th>
                <th className="text-right pb-1 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {invoice.items.map((item, i) => (
                <tr key={i} className="py-1">
                  <td className="py-1 pr-2">
                    {item.name}
                    {item.gstRatePercent > 0 && (
                      <span className="text-neutral-400 text-[10px] ml-1">({item.gstRatePercent}%)</span>
                    )}
                  </td>
                  <td className="py-1 text-center">{item.quantity}</td>
                  <td className="py-1 text-right">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="py-1 text-right font-semibold">₹{(item.unitPrice * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-neutral-300" />

          {/* Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span>₹{Number(invoice.subtotalAmount).toFixed(2)}</span>
            </div>
            {Number(invoice.gstAmount) > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-500">GST</span>
                <span>₹{Number(invoice.gstAmount).toFixed(2)}</span>
              </div>
            )}
            {Number(invoice.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>−₹{Number(invoice.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm pt-1 border-t border-neutral-300">
              <span>TOTAL</span>
              <span>₹{Number(invoice.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-neutral-300" />

          {/* Payment */}
          <div className="flex justify-between text-xs">
            <span className="text-neutral-500">Payment</span>
            <span className="font-bold">{invoice.paymentMethod} — PAID ✓</span>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-neutral-400 pt-2">
            Thank you for shopping with us! 🙏
          </div>
        </div>
      </div>

      {/* Print-only styles injected via global CSS (see globals.css) */}
    </div>
  );
}
