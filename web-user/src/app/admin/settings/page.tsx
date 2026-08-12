"use client";

import React, { useState } from "react";
import { Store, Bell, ShieldCheck, CreditCard, Globe, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState("Gupta Kirana Store");
  const [storePhone, setStorePhone] = useState("+91 98765 43210");
  const [storeAddress, setStoreAddress] = useState("Connaught Place, New Delhi - 110001");
  const [gst, setGst] = useState("27AABCU9603R1ZX");
  const [notifications, setNotifications] = useState({ orders: true, lowStock: true, payments: false });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Configure your store settings</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Info */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <Store size={18} className="text-emerald-400" />
            <h2 className="font-bold text-neutral-900 dark:text-white">Store Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Store Name", value: storeName, setter: setStoreName, placeholder: "Your store name" },
              { label: "Phone Number", value: storePhone, setter: setStorePhone, placeholder: "+91 XXXXX XXXXX" },
            ].map((field, i) => (
              <div key={i} className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{field.label}</label>
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-600 outline-none focus:border-emerald-600 transition-colors"
                />
              </div>
            ))}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Store Address</label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">GST Number</label>
              <input
                type="text"
                value={gst}
                onChange={(e) => setGst(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white outline-none focus:border-emerald-600 transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <Bell size={18} className="text-emerald-400" />
            <h2 className="font-bold text-neutral-900 dark:text-white">Notification Preferences</h2>
          </div>
          <div className="space-y-3">
            {[
              { key: "orders" as const, label: "New Order Alerts", desc: "Get notified when a new order is placed" },
              { key: "lowStock" as const, label: "Low Stock Alerts", desc: "Alert when product stock falls below 10 units" },
              { key: "payments" as const, label: "Payment Confirmations", desc: "Receive payment success notifications" },
            ].map((notif) => (
              <div key={notif.key} className="flex items-center justify-between p-3 bg-neutral-100 dark:bg-neutral-800/40 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">{notif.label}</p>
                  <p className="text-xs text-neutral-500">{notif.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications((prev) => ({ ...prev, [notif.key]: !prev[notif.key] }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    notifications[notif.key] ? "bg-emerald-600" : "bg-neutral-700"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      notifications[notif.key] ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className={`w-full py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all ${
            saved
              ? "bg-emerald-500 text-neutral-900 dark:text-white"
              : "bg-emerald-600 hover:bg-emerald-500 text-neutral-900 dark:text-white shadow-lg shadow-emerald-900/40"
          }`}
        >
          <Save size={16} />
          {saved ? "Settings Saved!" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
