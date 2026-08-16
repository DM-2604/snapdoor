// app/page.tsx — root redirect to dashboard or login

import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/dashboard');
}
