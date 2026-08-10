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
import type { CaseStudyListItem } from '@/lib/api/content/case-studies';

type CaseStudyCardProps = {
  caseStudy: CaseStudyListItem;
  isPending?: boolean;
  onPreview: (caseStudy: CaseStudyListItem) => void;
  onEdit: (caseStudy: CaseStudyListItem) => void;
  onPublish: (caseStudy: CaseStudyListItem) => void;
  onDelete: (caseStudy: CaseStudyListItem) => void;
};

function isLocaleComplete(
  caseStudy: CaseStudyListItem,
  locale: 'en' | 'de',
): boolean {
  return Boolean(
    caseStudy.titles[locale] &&
    caseStudy.slugs[locale] &&
    caseStudy.summaries[locale],
  );
}

export function CaseStudyCard({
  caseStudy,
  isPending = false,
  onPreview,
  onEdit,
  onPublish,
  onDelete,
}: CaseStudyCardProps) {
  const title =
    caseStudy.titles.en || caseStudy.titles.de || 'Untitled case study';
  const summary = caseStudy.summaries.en || caseStudy.summaries.de;
  const isPublished = caseStudy.status === 'PUBLISHED';
  const hasStatus = caseStudy.status !== undefined;
  const enComplete = isLocaleComplete(caseStudy, 'en');
  const deComplete = isLocaleComplete(caseStudy, 'de');
  const hasMedia = Boolean(caseStudy.media?.url);

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
            <span className="sr-only">Case study actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="end"
            sideOffset={4}
            className="w-44"
          >
            <DropdownMenuItem onClick={() => onPreview(caseStudy)}>
              <EyeIcon />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(caseStudy)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            {!isPublished && (
              <DropdownMenuItem onClick={() => onPublish(caseStudy)}>
                <SendIcon />
                Publish
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(caseStudy)}
            >
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
        {hasMedia && caseStudy.media.type === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob-storage media URLs; next/image adds no value at this size
          <img
            src={caseStudy.media.url}
            alt={caseStudy.media.alt ?? ''}
            className="h-full w-full object-cover"
          />
        ) : hasMedia && caseStudy.media.type === 'video' ? (
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
          {caseStudy.category?.name ?? 'Uncategorized'}
          <span className="text-muted-foreground"> · {caseStudy.client}</span>
        </p>

        <h2 className="mt-3 line-clamp-2 max-w-lg font-heading text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>

        {summary && (
          <p className="mt-3 line-clamp-3 max-w-lg font-sans text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          {hasStatus ? (
            <span
              className={cn(
                'rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase',
                isPublished
                  ? 'border-primary/20 bg-primary/10 text-primary'
                  : 'border-border bg-muted text-muted-foreground',
              )}
            >
              {isPublished ? 'Published' : 'Draft'}
            </span>
          ) : (
            <span />
          )}
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
