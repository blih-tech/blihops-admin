'use client';

import {
  ClapperboardIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  PlayIcon,
  SendIcon,
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
import type { InsightListItem } from '@/lib/api/content/insights';

type InsightCardProps = {
  insight: InsightListItem;
  isPending?: boolean;
  onPreview: (insight: InsightListItem) => void;
  onEdit: (insight: InsightListItem) => void;
  onPublish: (insight: InsightListItem) => void;
  onDelete: (insight: InsightListItem) => void;
};

function isLocaleComplete(
  insight: InsightListItem,
  locale: 'en' | 'de',
): boolean {
  return Boolean(
    insight.titles[locale] && insight.slugs[locale] && insight.excerpts[locale],
  );
}

export function InsightCard({
  insight,
  isPending = false,
  onPreview,
  onEdit,
  onPublish,
  onDelete,
}: InsightCardProps) {
  const title = insight.titles.en || insight.titles.de || 'Untitled insight';
  const excerpt = insight.excerpts.en || insight.excerpts.de;
  const isPublished = insight.status === 'PUBLISHED';
  const enComplete = isLocaleComplete(insight, 'en');
  const deComplete = isLocaleComplete(insight, 'de');
  const hasMedia = Boolean(insight.media?.url);

  return (
    <article
      aria-busy={isPending}
      className={cn(
        'group relative flex min-h-full min-w-0 flex-col border border-border bg-background p-4 transition-[opacity,background-color] duration-300 hover:bg-muted/50 sm:p-5',
        isPending && 'opacity-60',
      )}
    >
      <div className="absolute top-3 right-3 z-10 opacity-0 transition-opacity group-focus-within:opacity-100 md:group-hover:opacity-100">
        <DropdownMenu>
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
            <span className="sr-only">Insight actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="end"
            sideOffset={4}
            className="w-44"
          >
            <DropdownMenuItem onClick={() => onPreview(insight)}>
              <EyeIcon />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(insight)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            {!isPublished && (
              <DropdownMenuItem onClick={() => onPublish(insight)}>
                <SendIcon />
                Publish
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(insight)}
            >
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
        {hasMedia && insight.media.type === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob-storage media URLs; next/image adds no value at this size
          <img
            src={insight.media.url}
            alt={insight.media.alt ?? ''}
            className="h-full w-full object-cover"
          />
        ) : hasMedia && insight.media.type === 'video' ? (
          <div className="flex size-full items-center justify-center bg-primary">
            <PlayIcon className="size-8 fill-current text-primary-foreground" />
          </div>
        ) : (
          <div className="flex size-full items-center justify-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-foreground/90 text-background shadow-md">
              <ClapperboardIcon className="size-5" />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <p className="font-sans text-[11px] font-medium text-primary">
          {insight.category?.name ?? 'Uncategorized'}
          <span className="text-muted-foreground"> · {insight.author}</span>
        </p>

        <h2 className="mt-3 line-clamp-2 max-w-lg font-heading text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>

        {excerpt && (
          <p className="mt-3 line-clamp-3 max-w-lg font-sans text-sm leading-relaxed text-muted-foreground">
            {excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <span className="font-mono text-[10px] text-muted-foreground">
            {insight.readTimeMinutes} min read
          </span>
          <div className="flex items-center gap-1.5">
            <LocaleBadge locale="EN" complete={enComplete} />
            <LocaleBadge locale="DE" complete={deComplete} />
          </div>
        </div>
      </div>
    </article>
  );
}

function LocaleBadge({
  locale,
  complete,
}: {
  locale: string;
  complete: boolean;
}) {
  return (
    <span
      className={cn(
        'rounded-full border px-2 py-0.5 font-mono text-[10px]',
        complete
          ? 'border-primary/20 bg-primary/10 text-primary'
          : 'border-border bg-muted text-muted-foreground',
      )}
    >
      {locale} {complete ? '✓' : '–'}
    </span>
  );
}
