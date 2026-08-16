'use client';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthModal } from "@/components/auth/AuthModal";
import React, { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { customerApi } from "@/lib/customer-api";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * AppInit: runs once on mount.
 * 1. Call me() to check for an existing auth cookie.
 * 2a. If authenticated → login(user) → mergeGuestCart() (backend is truth)
 * 2b. If guest         → hydrateFromStorage() (localStorage with TTL check)
 *
 * Blocks rendering until resolved to prevent the race where a guest item
 * gets added to Zustand after mergeGuestCart has already cleared localStorage.
 */
function AppInit({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    customerApi
      .me()
      .then(async (user) => {
        if (user) {
          useAuthStore.getState().login({
            id: user.id,
            phoneNumber: user.phoneNumber,
            name: user.name,
            role: user.role,
          });
          // Authenticated: merge any guest items into backend (server is truth)
          await useCartStore.getState().mergeGuestCart().catch(() => {});
        } else {
          // Guest: load from localStorage with TTL check
          useCartStore.getState().hydrateFromStorage();
        }
      })
      .catch(() => {
        // Network error or expired cookie — treat as guest
        useCartStore.getState().hydrateFromStorage();
      })
      .finally(() => onReady());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// Note: metadata export requires server component, so we inline it manually
// when using QueryClientProvider (which requires 'use client')
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));
  const [isReady, setIsReady] = useState(false);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <title>GreenMart — Shop Local, Deliver Fast</title>
        <meta name="description" content="Order from local stores near you. Fresh groceries, medicines, dairy and more — delivered fast." />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-white dark:bg-neutral-900 dark:bg-neutral-950 text-neutral-900 dark:text-white"
        suppressHydrationWarning
      >
        <QueryClientProvider client={queryClient}>
          <AppInit onReady={() => setIsReady(true)} />
          {isReady ? (
            <>
              {children}
              {/* Global auth modal — mounted once at root, triggered by authStore.openAuthModal() */}
              <AuthModal />
            </>
          ) : (
            /* Minimal spinner blocks interaction until auth+cart init resolves */
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </QueryClientProvider>
      </body>
    </html>
  );
}

