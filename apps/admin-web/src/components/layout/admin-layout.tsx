"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Percent,
  Store,
  Tag,
  ScrollText,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Leaf,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";

const navItems = [
  { href: '/dashboard',   label: 'Dashboard',    icon: LayoutDashboard, exact: true },
  { href: '/geography',   label: 'Geography',    icon: MapPin },
  { href: '/commission',  label: 'Commission',   icon: Percent },
  { href: '/stores',      label: 'Stores',       icon: Store },
  { href: '/categories',  label: 'Categories',   icon: Tag },
  { href: '/audit-logs',  label: 'Audit Log',    icon: ScrollText },
  { href: '/settings',    label: 'Settings',     icon: Settings },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // ── Sidebar state — lives in useUIStore (genuine cross-navigation UI state) ──
  const sidebarOpen = useUIStore((s) => !s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  // ── Auth hydration — populate useAuthStore from the session cookie on mount ──
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    fetch('/api/session')
      .then((r) => r.json())
      .then(({ user }) => {
        setUser(user ?? null);
        setHydrated();
      })
      .catch(() => setHydrated()); // don't block UI if session fetch fails
  }, [setUser, setHydrated]);

  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    useAuthStore.getState().logout();
    router.replace('/login');
  }

  // On mobile the sidebar is an overlay — close it when a link is tapped
  function handleNavClick() {
    setSidebarCollapsed(true);
  }

  const displayName = currentUser?.name ?? 'Admin';
  // Initials for avatar: up to 2 chars from name
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Leaf size={16} className="text-white" />
            </div>
            <div>
              <span className="font-black text-neutral-900 text-[15px] tracking-tight block leading-tight">LocalMart</span>
              <span className="text-emerald-600/80 text-[10px] font-bold uppercase tracking-wider hidden sm:block leading-tight">Super Admin</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-sm shadow-red-500/30">1</span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-neutral-200/60">
            <div className="w-9 h-9 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-md">
              {initials || 'SA'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-neutral-900 leading-none">{displayName}</p>
              <p className="text-[11px] font-medium text-neutral-500 mt-0.5">
                {currentUser?.adminRole ?? 'Platform Owner'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={`w-60 bg-white border-r border-neutral-200 flex flex-col py-5 shrink-0 transition-all duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:relative inset-y-0 left-0 top-14 md:top-0 z-40`}
        >
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  <Icon size={17} className={active ? 'text-white' : 'text-neutral-500'} />
                  {item.label}
                  {active && <ChevronRight size={14} className="ml-auto opacity-70" />}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 mt-4 pt-4 border-t border-neutral-200">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut size={17} className="text-neutral-400 group-hover:text-red-500 transition-colors" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-neutral-900/40 z-30"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
