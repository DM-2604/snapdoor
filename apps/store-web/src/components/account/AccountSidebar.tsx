"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  Wallet,
  Tag,
  Bell,
  RotateCcw,
  Star,
  Share2,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { customerApi } from "@/lib/customer-api";

interface AccountSidebarProps {
  activeTab?: string;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({ activeTab }) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  
  const userName = user?.name || "Guest User";
  const userInitials = userName.substring(0, 2).toUpperCase();
  const userPhone = user?.phoneNumber || "";

  type MenuItem = {
    id: string;
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
  };

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", href: "/account", icon: LayoutDashboard },
    { id: "orders", label: "My Orders", href: "/account/orders", icon: Package },
    // { id: "wishlist", label: "My Wishlist", href: "/account/wishlist", icon: Heart, badge: 12 },
    { id: "addresses", label: "My Addresses", href: "/account/addresses", icon: MapPin },
    // { id: "wallet", label: "My Wallet", href: "/account/wallet", icon: Wallet },
    // { id: "coupons", label: "My Coupons", href: "/account/coupons", icon: Tag, badge: 5 },
    // { id: "notifications", label: "Notifications", href: "/account/notifications", icon: Bell },
    // { id: "returns", label: "Returns & Refunds", href: "/account/returns", icon: RotateCcw },
    // { id: "reviews", label: "My Reviews", href: "/account/reviews", icon: Star },
    // { id: "refer", label: "Refer & Earn", href: "/account/refer", icon: Share2 },
    { id: "settings", label: "Account Settings", href: "/account/settings", icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 shadow-xs space-y-4 shrink-0 text-xs">
      {/* Profile Header */}
      <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800">
        <div className="w-11 h-11 rounded-full bg-emerald-700 text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0 uppercase">
          {userInitials}
        </div>
        <div className="min-w-0">
          <h4 className="font-extrabold text-neutral-900 dark:text-white truncate text-xs">{userName}</h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium truncate">{userPhone}</p>
          <button className="text-[10px] font-bold text-primary hover:underline mt-0.5">
            View Profile
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab ? activeTab === item.id : pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                isActive
                  ? "bg-emerald-50 text-primary border border-emerald-200/60 shadow-2xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-950 hover:text-neutral-900 dark:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} className={isActive ? "text-primary" : "text-neutral-400"} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            customerApi.logout().then(() => window.location.href = '/');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-neutral-500 dark:text-neutral-400 hover:bg-red-50 hover:text-danger transition-all text-left"
        >
          <LogOut size={16} className="text-neutral-400" />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
};
