'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LifeBuoyIcon, ShieldCheckIcon } from 'lucide-react';

import { Logo } from '@/components/layout/Logo';

type AuthShellProps = {
  children: React.ReactNode;
};

const TRUST_ITEMS = [
  'AI-powered operations',
  'Dedicated pods',
  'Clear SLAs',
  'Weekly reporting',
];

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="flex h-svh flex-col overflow-hidden bg-muted text-foreground lg:flex-row">
      <aside className="relative hidden w-[42%] max-w-[560px] shrink-0 overflow-hidden bg-foreground lg:block xl:w-[520px]">
        <Image
          src="/auth-brand.jpg"
          alt="A Blih Ops delivery team at work in Addis Ababa"
          fill
          priority
          sizes="560px"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-foreground/85 to-foreground"
          aria-hidden="true"
        />
        <div className="absolute top-6 left-6">
          <div className="w-fit rounded-lg bg-white/95 p-1.5">
            <Logo className="h-8 w-auto" />
          </div>
        </div>
        <div className="absolute inset-x-8 bottom-5">
          <div className="max-w-[430px]">
            <span
              className="mb-3 block h-0.5 w-6 bg-primary"
              aria-hidden="true"
            />
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-white/70 uppercase">
              Blih Ops workspace
            </p>
            <h1 className="mt-2 font-heading text-2xl leading-[1.1] font-semibold tracking-[-0.025em] text-white xl:text-3xl">
              Operations, running on structure, automation, and accountability.
            </h1>
            <p className="mt-2 max-w-[400px] text-[13px] leading-[1.5] text-white/70">
              Access your managed pods, live reports, and SLA performance from
              one place. Your work, measured and on track.
            </p>
          </div>
          <ul className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2">
            {TRUST_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5 font-mono text-[9px] font-semibold tracking-[0.08em] text-white/60 uppercase"
              >
                <span
                  className="size-1 rounded-full bg-primary"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="flex items-center justify-between px-4 py-2.5 lg:hidden">
          <div className="rounded-lg border border-border bg-white p-1">
            <Logo className="h-7 w-auto" />
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase">
            <ShieldCheckIcon
              className="size-3 text-primary"
              aria-hidden="true"
            />
            Secure access
          </span>
        </div>

        <div className="hidden justify-end px-6 py-2.5 lg:flex">
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            <ShieldCheckIcon
              className="size-3 text-primary"
              aria-hidden="true"
            />
            Secure access
          </span>
        </div>

        <div className="flex min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 lg:px-12">
          <div className="m-auto w-full max-w-[400px]">{children}</div>
        </div>

        <footer className="flex items-center justify-between gap-4 px-4 py-2 text-muted-foreground sm:px-6">
          <span className="font-mono text-[9px] font-semibold tracking-[0.07em] uppercase">
            © {new Date().getFullYear()} Blih Ops. All rights reserved.
          </span>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <LifeBuoyIcon className="size-3" aria-hidden="true" />
            Need help?
          </Link>
        </footer>
      </div>
    </main>
  );
}
