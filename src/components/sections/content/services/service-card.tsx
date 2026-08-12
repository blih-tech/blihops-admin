'use client';

import { createElement } from 'react';

import { cn } from '@/lib/utils';
import type { Service } from '@/lib/api/content/services';

import { getServiceIcon } from './service-icons';

type ServiceCardProps = {
  service: Service;
  isPending?: boolean;
};

export function ServiceCard({ service, isPending = false }: ServiceCardProps) {
  const title =
    service.content.en?.title ||
    service.content.de?.title ||
    'Untitled service';
  const subtitle = service.content.en?.subtitle || service.content.de?.subtitle;
  const tag = service.content.en?.tag || service.content.de?.tag;

  return (
    <article
      aria-busy={isPending}
      className={cn(
        'group relative flex min-h-full min-w-0 flex-col border border-border bg-background p-4 transition-[opacity,background-color] duration-300 hover:bg-muted/50 sm:p-5',
        isPending && 'opacity-60',
      )}
    >
      <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- blob-storage media URLs; next/image adds no value at this size */}
        <img
          src={service.imageUrl}
          alt={service.alt}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-3 left-3 flex size-9 items-center justify-center rounded-md border border-border bg-background/90 text-foreground shadow-sm backdrop-blur-sm">
          {createElement(getServiceIcon(service.icon), {
            className: 'size-4',
            strokeWidth: 1.75,
          })}
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-center justify-between gap-2">
          {tag ? (
            <p className="truncate font-sans text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
              {tag}
            </p>
          ) : (
            <span />
          )}
          <span className="shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            #{service.displayOrder + 1}
          </span>
        </div>

        <h2 className="mt-3 line-clamp-2 font-heading text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-2 line-clamp-2 font-sans text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-primary uppercase">
            Live
          </span>
          <div className="flex items-center gap-1.5">
            <LocaleBadge locale="EN" present={Boolean(service.content.en)} />
            <LocaleBadge locale="DE" present={Boolean(service.content.de)} />
          </div>
        </div>
      </div>
    </article>
  );
}

function LocaleBadge({
  locale,
  present,
}: {
  locale: string;
  present: boolean;
}) {
  return (
    <span
      className={cn(
        'rounded-full border px-2 py-0.5 font-mono text-[10px]',
        present
          ? 'border-primary/20 bg-primary/10 text-primary'
          : 'border-border bg-muted text-muted-foreground',
      )}
    >
      {locale} {present ? '✓' : '–'}
    </span>
  );
}
