'use client';

import { useState } from 'react';
import { LoaderCircleIcon, LogOutIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export default function OverviewPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);
    try {
      await authClient.signOut();
      await fetch('/api/auth/session', { method: 'DELETE' });
    } finally {
      setIsPending(false);
      router.replace('/auth/sign-in');
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6">
        <h1 className="font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground">
          Overview
        </h1>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={handleSignOut}
          disabled={isPending}
        >
          {isPending ? (
            <LoaderCircleIcon
              className="animate-spin"
              data-icon="inline-start"
              aria-hidden="true"
            />
          ) : (
            <LogOutIcon data-icon="inline-start" aria-hidden="true" />
          )}
          Sign out
        </Button>
      </div>
    </main>
  );
}
