"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { User, Lock, Bell, ChevronRight, Save, ShieldCheck, Sun, Moon } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect } from "react";

export default function SettingsPage() {
  const { isDarkMode, setDarkMode } = useStore();
  const { user } = useAuthStore();
  
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "Unspecified",
  });

  useEffect(() => {
    if (user) {
      const parts = (user.name || "").split(" ");
      setProfile({
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        email: "", // Not available in CustomerUser
        phone: user.phoneNumber || "",
        gender: "Unspecified",
      });
    }
  }, [user]);

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });

  const [notifications, setNotifications] = useState({
    whatsapp: true,
    sms: true,
    email: false,
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile details updated successfully!");
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirmPass) {
      alert("New password and confirm password do not match!");
      return;
    }
    alert("Password updated successfully!");
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-xs">
      <Header />
      <CategoryNav />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <Link href="/account" className="hover:text-primary">My Account</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900 dark:text-white font-bold">Account Settings</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          <AccountSidebar activeTab="settings" />

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            
            {/* Header Bar */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs">
              <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">Account Settings</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Manage your personal profile, security credentials, and preferences</p>
            </div>

            {/* Personal Info Form */}
            <form onSubmit={handleProfileSave} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-extrabold text-neutral-900 dark:text-white text-sm border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <User size={18} className="text-primary" />
                <h3>Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">First Name</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">Phone Number</label>
                  <input
                    type="text"
                    value={profile.phone}
                    disabled
                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-500 dark:text-neutral-400 cursor-not-allowed dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors text-xs flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>

            {/* Change Password Form */}
            <form onSubmit={handlePasswordSave} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-extrabold text-neutral-900 dark:text-white text-sm border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <Lock size={18} className="text-primary" />
                <h3>Security & Password</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.confirmPass}
                    onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-800 hover:bg-neutral-900 text-white font-bold rounded-xl transition-colors text-xs"
                >
                  Update Password
                </button>
              </div>
            </form>

            {/* Theme Preferences */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-extrabold text-neutral-900 dark:text-white text-sm border-b border-neutral-100 dark:border-neutral-800 pb-3">
                {isDarkMode ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
                <h3>Theme Preferences</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setDarkMode(false);
                    localStorage.setItem('theme', 'light');
                  }}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    !isDarkMode
                      ? "border-primary bg-emerald-50/50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-400"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <Sun size={24} className={!isDarkMode ? "text-primary" : ""} />
                  <span className="font-bold text-xs">Light Mode</span>
                </button>
                <button
                  onClick={() => {
                    setDarkMode(true);
                    localStorage.setItem('theme', 'dark');
                  }}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    isDarkMode
                      ? "border-primary bg-emerald-50/50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-400"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <Moon size={24} className={isDarkMode ? "text-primary" : ""} />
                  <span className="font-bold text-xs">Dark Mode</span>
                </button>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-extrabold text-neutral-900 dark:text-white text-sm border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <Bell size={18} className="text-primary" />
                <h3>Communication Preferences</h3>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 border border-neutral-100 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-950">
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-xs">WhatsApp Updates</h4>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Receive order status, delivery tracking & invoice receipts on WhatsApp</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.whatsapp}
                    onChange={(e) => setNotifications({ ...notifications, whatsapp: e.target.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 border border-neutral-100 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-950">
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-xs">SMS Notifications</h4>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Get OTPs and urgent delivery updates via SMS</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                </label>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
