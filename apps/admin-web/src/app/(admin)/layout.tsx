// app/(admin)/layout.tsx
// Server Component — reads httpOnly cookie for auth guard.
// Redirects to /login if cookie is missing (no client-side JS needed).

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AdminLayoutClient } from '@/components/layout/admin-layout';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('lm-admin-token');

  if (!token?.value) {
    redirect('/login');
  }

  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}
