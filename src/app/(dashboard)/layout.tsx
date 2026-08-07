'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/auth-client';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!isPending && (session === null || session === undefined)) {
      router.replace('/auth/sign-in');
    } else if (!isPending && role !== 'admin') {
      router.replace('/auth/sign-in');
    }
  }, [isPending, session, router]);

  if (isPending || session === null || session === undefined) {
    return null;
  }

  if ((session.user as { role?: string }).role !== 'admin') {
    return null;
  }

  return children;
}
