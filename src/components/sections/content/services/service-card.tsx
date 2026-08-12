'use client';

import { createElement, useState } from 'react';
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Service } from '@/lib/api/content/services';

import { getServiceIcon } from './service-icons';

type ServiceCardProps = {
  service: Service;
  isPending?: boolean;
  onEdit?: (service: Service) => void;
};

export function ServiceCard({
  service,
  isPending = false,
  onEdit,
}: ServiceCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
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
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex size-9 items-center justify-center rounded-md border border-border bg-foreground/90 text-background shadow-sm">
          {createElement(getServiceIcon(service.icon), {
            className: 'size-4',
            strokeWidth: 1.75,
          })}
        </div>
      </div>

      <div
        onClick={(event) => event.stopPropagation()}
        className="absolute top-3 right-3 z-10 opacity-0 transition-opacity group-focus-within:opacity-100 md:group-hover:opacity-100"
      >
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="bg-foreground text-background hover:bg-foreground/90 hover:text-background"
              />
            }
          >
            <EllipsisVerticalIcon />
            <span className="sr-only">Service actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="end"
            sideOffset={4}
            className="w-44"
          >
            <DropdownMenuItem
              onClick={() => setMenuOpen(false)}
              className="focus:bg-muted focus:text-foreground"
            >
              <EyeIcon />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setMenuOpen(false);
                onEdit?.(service);
              }}
              className="focus:bg-muted focus:text-foreground"
            >
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setMenuOpen(false)}
            >
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
