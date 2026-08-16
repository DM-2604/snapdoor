"use client";

// src/components/shared/Providers.tsx
// Client wrapper: mounts React Query provider + AuthModal at root.

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthModal } from "@/components/auth/AuthModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Auth modal mounted at root so it overlays any page */}
      <AuthModal />
    </QueryClientProvider>
  );
}
