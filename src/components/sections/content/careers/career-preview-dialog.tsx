'use client';

import { useQuery } from '@tanstack/react-query';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { getCareer, type CareerListItem } from '@/lib/api/content/careers';

type CareerPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  career: CareerListItem | null;
};

export function CareerPreviewDialog({
  open,
  onOpenChange,
  career,
}: CareerPreviewDialogProps) {
  const { data, error, isPending } = useQuery({
    queryKey: ['content', 'careers', 'detail', career?.id],
    queryFn: () => getCareer(career?.id as string),
    enabled: Boolean(open && career),
  });

  const detail = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-md p-0 sm:max-w-2xl">
        <DialogTitle className="sr-only">
          Preview: {career?.title ?? 'Career role'}
        </DialogTitle>

        {isPending ? (
          <PreviewSkeleton />
        ) : error ? (
          <div className="p-6">
            <ErrorState
              title="Failed to load career role"
              message={error.message}
            />
          </div>
        ) : detail ? (
          <article className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="font-sans text-[11px] font-medium text-muted-foreground">
                {detail.department} · {detail.location} ·{' '}
                {detail.employmentType}
              </p>
              <span
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase',
                  detail.isActive
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'border-border bg-muted text-muted-foreground',
                )}
              >
                {detail.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {detail.title}
            </h2>

            <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground sm:text-base">
              {detail.summary}
            </p>

            <div className="mt-6 divide-y divide-border border-t border-border">
              <PreviewSection label="Overview" items={detail.overview} />
              <PreviewSection
                label="Responsibilities"
                items={detail.responsibilities}
              />
              <PreviewSection
                label="Requirements"
                items={detail.requirements}
              />
            </div>
          </article>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No role data"
              description="This career role has no data to preview."
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PreviewSection({ label, items }: { label: string; items: string[] }) {
  return (
    <section className="py-6">
      <p className="font-mono text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      {items.length > 0 ? (
        <ul className="mt-3 grid gap-2 pl-4 list-disc marker:text-primary">
          {items.map((item, index) => (
            <li
              key={index}
              className="pl-1 font-sans text-sm leading-relaxed text-muted-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Not provided yet.</p>
      )}
    </section>
  );
}

function PreviewSkeleton() {
  return (
    <div>
      <div className="flex flex-col gap-5 p-6 sm:p-8">
        <Skeleton className="h-3 w-1/3 rounded-md" />
        <Skeleton className="h-8 w-2/3 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    </div>
  );
}
