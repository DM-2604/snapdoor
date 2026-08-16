'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Store,
  ChevronRight,
  Sun,
  Moon,
  FileCheck,
  Tag,
  Receipt,
  CreditCard,
} from 'lucide-react';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { useStoreOwnerAuthStore } from '@/stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { storeOwnerApi } from '@/lib/api';

const navItems = [
  { href: '/dashboard',         label: 'Dashboard',   icon: LayoutDashboard, exact: true },
  { href: '/products',          label: 'Products',     icon: Package },
  { href: '/categories',        label: 'Categories',   icon: Tag },
  { href: '/orders',            label: 'Orders',       icon: ShoppingBag },
  { href: '/billing',           label: 'POS Billing',  icon: CreditCard },
  { href: '/billing/invoices',  label: 'Invoices',     icon: Receipt },
  { href: '/offers',            label: 'Offers',       icon: Tag },
  { href: '/analytics',         label: 'Analytics',    icon: BarChart3 },
  { href: '/settings',          label: 'Settings',     icon: Settings },
];

export function StoreOwnerLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggle } = useAdminTheme();
  const currentUser = useStoreOwnerAuthStore((s) => s.currentUser);

  const { data: profile } = useQuery({
    queryKey: ['store-profile'],
    queryFn: () => storeOwnerApi.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
  const isLive = profile?.status === 'LIVE';
  const visibleNavItems = isLive
    ? navItems
    : navItems.filter((item) => item.href === '/settings');

  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    useStoreOwnerAuthStore.getState().logout();
    router.replace('/login');
  }

  const displayName = currentUser?.name ?? 'Seller';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white flex flex-col transition-colors">
      {/* Top Header */}
      <header className="h-14 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 md:px-6 shrink-0 z-50 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-md">
              G
            </div>
            <span className="font-black text-neutral-900 dark:text-white text-sm">GreenMart</span>
            <span className="text-neutral-500 text-xs font-medium hidden sm:inline">/ Seller Panel</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {isDark ? <Sun size={18} className="text-emerald-400" /> : <Moon size={18} className="text-neutral-600" />}
          </button>
          <button className="relative p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-neutral-900"></span>
          </button>
          <div className="flex items-center gap-2 pl-4 border-l border-neutral-200 dark:border-neutral-800">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20">
              {initials || 'S'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-neutral-900 dark:text-white leading-none">{displayName}</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">Seller</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col py-6 shrink-0 transition-all duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 fixed md:relative inset-y-0 left-0 top-14 md:top-0 z-40`}
        >
          <nav className="flex-1 px-4 space-y-1.5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                  {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
                </Link>
              );
            })}

            {/* KYC link — shown as a secondary item */}
            <Link
              href="/kyc"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white transition-all"
            >
              <FileCheck size={18} />
              KYC / Documents
            </Link>
          </nav>

          <div className="px-4 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-neutral-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950 p-4 md:p-8 transition-colors">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
