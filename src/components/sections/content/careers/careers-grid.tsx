'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BriefcaseIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dots } from '@/components/shared/Dots';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { CareerCard } from '@/components/sections/content/careers/career-card';
import { listCareers } from '@/lib/api/content/careers';

const PAGE_SIZE = 12;

type ActiveFilter = boolean | undefined;

const STATUS_TABS: { value: ActiveFilter; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
];

export function CareersGrid() {
  const [isActive, setIsActive] = useState<ActiveFilter>(undefined);
  const [page, setPage] = useState(1);

  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: [
      'content',
      'careers',
      'admin',
      { page, pageSize: PAGE_SIZE, isActive },
    ],
    queryFn: () => listCareers({ page, pageSize: PAGE_SIZE, isActive }),
  });

  function selectFilter(next: ActiveFilter) {
    setIsActive(next);
    setPage(1);
  }

  const items = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const hasMore = data ? page < data.meta.totalPages : false;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Careers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          English-only roles shown on the website. Only active roles are public.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
          {STATUS_TABS.map((tab) => {
            const isTabActive = isActive === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                aria-pressed={isTabActive}
                onClick={() => selectFilter(tab.value)}
                className={cn(
                  'cursor-pointer rounded-sm px-3 py-1.5 font-sans text-xs font-medium transition-colors',
                  isTabActive
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
            {total} {total === 1 ? 'role' : 'roles'}
          </p>
        )}
      </div>

      {isPending ? (
        <CareersSkeleton />
      ) : error ? (
        <ErrorState
          title="Failed to load career roles"
          message={error.message}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<BriefcaseIcon className="size-6" />}
          title="No career roles yet"
          description="Add your first role to advertise openings on the website."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {items.map((career) => (
              <CareerCard key={career.id} career={career} />
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

function CareersSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="border border-border bg-background p-4 sm:p-5"
        >
          <Skeleton className="h-3 w-1/3 rounded-md" />
          <Skeleton className="mt-3 h-6 w-2/3 rounded-md" />
          <Skeleton className="mt-3 h-4 w-full rounded-md" />
          <Skeleton className="mt-2 h-4 w-4/5 rounded-md" />
          <Skeleton className="mt-6 h-5 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}
