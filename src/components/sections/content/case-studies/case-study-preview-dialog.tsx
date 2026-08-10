'use client';

import { useQuery } from '@tanstack/react-query';
import { ClapperboardIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  getCaseStudy,
  type CaseStudyListItem,
} from '@/lib/api/content/case-studies';

const SECTIONS = [
  { key: 'challenge', label: 'Challenge' },
  { key: 'approach', label: 'Approach' },
  { key: 'outcome', label: 'Outcome' },
] as const;

type CaseStudyPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseStudy: CaseStudyListItem | null;
};

export function CaseStudyPreviewDialog({
  open,
  onOpenChange,
  caseStudy,
}: CaseStudyPreviewDialogProps) {
  const { data, error, isPending } = useQuery({
    queryKey: ['content', 'case-studies', 'detail', caseStudy?.id],
    queryFn: () => getCaseStudy(caseStudy?.id as string),
    enabled: Boolean(open && caseStudy),
  });

  const detail = data?.data;
  const content = detail?.content.en ?? detail?.content.de;
  const title =
    caseStudy?.titles.en || caseStudy?.titles.de || 'Case study preview';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-md p-0 sm:max-w-3xl">
        <DialogTitle className="sr-only">Preview: {title}</DialogTitle>

        {isPending ? (
          <PreviewSkeleton />
        ) : error ? (
          <div className="p-6">
            <ErrorState
              title="Failed to load case study"
              message={error.message}
            />
          </div>
        ) : detail && content ? (
          <article>
            <div className="relative aspect-video w-full overflow-hidden border-b border-border bg-muted">
              {detail.media.url && detail.media.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element -- blob-storage media URLs; next/image adds no value here
                <img
                  src={detail.media.url}
                  alt={detail.media.alt ?? ''}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-foreground/90 text-background shadow-md">
                    <ClapperboardIcon className="size-6" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-5 p-6 sm:p-8">
              <div>
                <p className="font-sans text-[11px] font-medium text-primary">
                  {detail.category?.name ?? 'Uncategorized'}
                  <span className="text-muted-foreground">
                    {' '}
                    · {detail.client}
                  </span>
                </p>
                <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {content.title}
                </h2>
                {content.summary && (
                  <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {content.summary}
                  </p>
                )}
              </div>

              {detail.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {detail.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full border border-border bg-muted px-2.5 py-0.5 font-sans text-[11px] text-muted-foreground"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="divide-y divide-border border-t border-border">
                {SECTIONS.map((section) => {
                  const html = content.body?.[section.key];
                  return (
                    <section key={section.key} className="py-6">
                      <p className="font-mono text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
                        {section.label}
                      </p>
                      {html ? (
                        <div
                          className="content-prose mt-3"
                          dangerouslySetInnerHTML={{ __html: html }}
                        />
                      ) : (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Not provided yet.
                        </p>
                      )}
                    </section>
                  );
                })}
              </div>
            </div>
          </article>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No content yet"
              description="This draft has no content to preview."
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PreviewSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="flex flex-col gap-5 p-6 sm:p-8">
        <Skeleton className="h-3 w-1/3 rounded-md" />
        <Skeleton className="h-8 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
        <Skeleton className="h-40 w-full rounded-md" />
        <Skeleton className="h-40 w-full rounded-md" />
      </div>
    </div>
  );
}
