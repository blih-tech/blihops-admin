'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderTreeIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { CategoryRow } from '@/components/sections/content/categories/category-row';
import { CategoryFormDialog } from '@/components/sections/content/categories/category-form-dialog';
import {
  createCategory,
  listCategories,
  type CategoriesResponse,
  type Category,
} from '@/lib/api/content/categories';
import { restoreSnapshot, takeSnapshot } from '@/lib/query/optimistic';
import { toastError, toastSuccess } from '@/lib/toast';

const CATEGORIES_KEY = ['content', 'categories'] as const;

export function CategoriesList() {
  const queryClient = useQueryClient();
  const { data, error, isPending, refetch } = useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: listCategories,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [draftName, setDraftName] = useState<string | null>(null);
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createCategory,
    onMutate: async (payload) => {
      const previous = takeSnapshot<CategoriesResponse>(
        queryClient,
        CATEGORIES_KEY,
      );
      const tempId = `temp-${crypto.randomUUID()}`;
      const tempCategory: Category = {
        id: tempId,
        name: payload.name,
      };
      queryClient.setQueryData<CategoriesResponse>(CATEGORIES_KEY, (old) =>
        old
          ? { ...old, items: [...old.items, tempCategory] }
          : { items: [tempCategory], meta: {} },
      );
      setDraftName(payload.name);
      setPendingRowId(tempId);
      setFormOpen(false);
      return { previous, tempId };
    },
    onSuccess: (result, _payload, context) => {
      queryClient.setQueryData<CategoriesResponse>(CATEGORIES_KEY, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((item) =>
                item.id === context.tempId ? result.data : item,
              ),
            }
          : old,
      );
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toastSuccess('Category added');
      setDraftName(null);
      setFormOpen(false);
    },
    onError: (err, _payload, context) => {
      if (context) {
        restoreSnapshot(queryClient, CATEGORIES_KEY, context.previous);
      }
      setFormOpen(true);
      toastError('Failed to add category', err.message);
    },
    onSettled: () => {
      setPendingRowId(null);
    },
  });

  const items = data?.items ?? [];
  const total = data?.items.length ?? 0;

  function openCreate() {
    setDraftName(null);
    setFormOpen(true);
  }

  function handleSave(name: string) {
    createMutation.mutate({ name });
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Shared vocabulary used by case studies and insights. Each record
            assigns exactly one category.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon data-icon="inline-start" />
          Add category
        </Button>
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
          action={
            <Button onClick={openCreate}>
              <PlusIcon data-icon="inline-start" />
              Add category
            </Button>
          }
        />
      ) : (
        <div className="divide-y divide-border rounded-md border border-border bg-card">
          {items.map((category) => (
            <div key={category.id}>
              <CategoryRow
                category={category}
                isPending={pendingRowId === category.id}
              />
            </div>
          ))}
        </div>
      )}

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialName={draftName ?? undefined}
        isSaving={createMutation.isPending}
        onSave={handleSave}
      />
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
