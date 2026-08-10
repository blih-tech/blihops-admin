'use client';

import { useQuery } from '@tanstack/react-query';
import { FolderTreeIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { CategoryRow } from '@/components/sections/content/categories/category-row';
import { listCategories } from '@/lib/api/content/categories';

export function CategoriesList() {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ['content', 'categories'],
    queryFn: listCategories,
  });

  const items = data?.items ?? [];
  const total = data?.items.length ?? 0;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Categories
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Shared vocabulary used by case studies and insights. Each record
          assigns exactly one category.
        </p>
      </div>

      {!isPending && !error && (
        <p className="font-mono text-[10px] text-muted-foreground">
          {total} {total === 1 ? 'category' : 'categories'}
        </p>
      )}

      {isPending ? (
        <CategoriesSkeleton />
      ) : error ? (
        <ErrorState
          title="Failed to load categories"
          message={error.message}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<FolderTreeIcon className="size-6" />}
          title="No categories yet"
          description="Create categories to organize case studies and insights."
        />
      ) : (
        <div className="divide-y divide-border rounded-md border border-border bg-card">
          {items.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="divide-y divide-border rounded-md border border-border bg-card">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="px-5 py-3.5">
          <Skeleton className="h-4 w-2/5 rounded-md" />
        </div>
      ))}
    </div>
  );
}
