'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { NewspaperIcon, PlusIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dots } from '@/components/shared/Dots';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { InsightCard } from '@/components/sections/content/insights/insight-card';
import { listInsights, type InsightListItem } from '@/lib/api/content/insights';
import { toastInfo } from '@/lib/toast';

const PAGE_SIZE = 12;

type StatusFilter = 'DRAFT' | 'PUBLISHED' | undefined;

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
];

export function InsightsGrid() {
  const router = useRouter();
  const [status, setStatus] = useState<StatusFilter>(undefined);
  const [page, setPage] = useState(1);

  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: [
      'content',
      'insights',
      'admin',
      { page, pageSize: PAGE_SIZE, status },
    ],
    queryFn: () => listInsights({ page, pageSize: PAGE_SIZE, status }),
  });

  function selectStatus(next: StatusFilter) {
    setStatus(next);
    setPage(1);
  }

  function handlePreview(insight: InsightListItem) {
    toastInfo(
      'Preview is not built yet',
      `“${insight.titles.en || insight.titles.de || insight.author}”`,
    );
  }

  function handleEdit(insight: InsightListItem) {
    toastInfo(
      'Edit is not built yet',
      `“${insight.titles.en || insight.titles.de || insight.author}”`,
    );
  }

  function handlePublish(insight: InsightListItem) {
    toastInfo(
      'Publish is not integrated yet',
      `“${insight.titles.en || insight.titles.de || insight.author}”`,
    );
  }

  function handleDelete(insight: InsightListItem) {
    toastInfo(
      'Delete is not integrated yet',
      `“${insight.titles.en || insight.titles.de || insight.author}”`,
    );
  }

  const items = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const hasMore = data ? page < data.meta.totalPages : false;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Insights
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bilingual insight articles shown on the website. Both English and
            German are required before publishing.
          </p>
        </div>
        <Button onClick={() => router.push('/content/insights/new')}>
          <PlusIcon data-icon="inline-start" />
          Add insight
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
          {STATUS_TABS.map((tab) => {
            const isActive = status === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectStatus(tab.value)}
                className={cn(
                  'cursor-pointer rounded-sm px-3 py-1.5 font-sans text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {!isPending && !error && (
          <p className="font-mono text-[10px] text-muted-foreground">
            {total} {total === 1 ? 'insight' : 'insights'}
          </p>
        )}
      </div>

      {isPending ? (
        <InsightsSkeleton />
      ) : error ? (
        <ErrorState
          title="Failed to load insights"
          message={error.message}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<NewspaperIcon className="size-6" />}
          title="No insights yet"
          description="Add your first insight article to share expertise on the website."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {items.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onPreview={handlePreview}
                onEdit={handleEdit}
                onPublish={handlePublish}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => current + 1)}
                disabled={isFetching}
              >
                {isFetching ? <Dots dots={3} /> : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="border border-border bg-background p-4 sm:p-5"
        >
          <Skeleton className="aspect-video w-full rounded-md" />
          <Skeleton className="mt-4 h-3 w-1/3 rounded-md" />
          <Skeleton className="mt-3 h-6 w-2/3 rounded-md" />
          <Skeleton className="mt-3 h-4 w-full rounded-md" />
          <Skeleton className="mt-2 h-4 w-4/5 rounded-md" />
          <Skeleton className="mt-6 h-4 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}
