'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { storeOwnerApi } from '@/lib/api';
import { PageSpinner } from '@/ui';

export function StoreOwnerAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['store-profile'],
    queryFn: () => storeOwnerApi.getProfile(),
    staleTime: 5 * 60 * 1000,      // 5 minutes
    gcTime: 10 * 60 * 1000,        // 10 minutes
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const isLive = profile?.status === 'LIVE';
  const shouldRedirectToKyc = !isLive && pathname !== '/kyc' && !pathname.startsWith('/settings');

  const isRedirecting = useRef(false);

  useEffect(() => {
    if (shouldRedirectToKyc) {
      if (!isRedirecting.current) {
        isRedirecting.current = true;
        router.replace('/kyc');
      }
    } else {
      isRedirecting.current = false;
    }
  }, [shouldRedirectToKyc, router]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  if (shouldRedirectToKyc) {
    return null;
  }

  return <>{children}</>;
}
