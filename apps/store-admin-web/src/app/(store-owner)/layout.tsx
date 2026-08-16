import { StoreOwnerAuthGuard } from '@/components/auth/store-owner-auth-guard';
import { StoreOwnerLayoutShell } from '@/components/layout/store-owner-layout-shell';

export default function StoreOwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreOwnerLayoutShell>
      <StoreOwnerAuthGuard>{children}</StoreOwnerAuthGuard>
    </StoreOwnerLayoutShell>
  );
}
