'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'motion/react';
import { FolderTreeIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { CategoryRow } from '@/components/sections/content/categories/category-row';
import { CategoryFormDialog } from '@/components/sections/content/categories/category-form-dialog';
import { ConfirmDeleteCategoryDialog } from '@/components/sections/content/categories/confirm-delete-category-dialog';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type CategoriesResponse,
  type Category,
} from '@/lib/api/content/categories';
import { restoreSnapshot, takeSnapshot } from '@/lib/query/optimistic';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  staggerContainer,
  fadeUpItem,
} from '@/components/shared/motion-variants';

const CATEGORIES_KEY = ['content', 'categories'] as const;

export function CategoriesList() {
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();
  const { data, error, isPending, refetch } = useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: listCategories,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [draftName, setDraftName] = useState<string | null>(null);
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

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

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateCategory(id, { name }),
    onMutate: async ({ id, name }) => {
      const previous = takeSnapshot<CategoriesResponse>(
        queryClient,
        CATEGORIES_KEY,
      );
      queryClient.setQueryData<CategoriesResponse>(CATEGORIES_KEY, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((item) =>
                item.id === id ? { ...item, name } : item,
              ),
            }
          : old,
      );
      return { previous };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toastSuccess('Category renamed');
    },
    onError: (err, _variables, context) => {
      if (context) {
        restoreSnapshot(queryClient, CATEGORIES_KEY, context.previous);
      }
      toastError('Failed to rename category', err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onMutate: async (id) => {
      const previous = takeSnapshot<CategoriesResponse>(
        queryClient,
        CATEGORIES_KEY,
      );
      queryClient.setQueryData<CategoriesResponse>(CATEGORIES_KEY, (old) =>
        old
          ? { ...old, items: old.items.filter((item) => item.id !== id) }
          : old,
      );
      setDeletingCategory(null);
      return { previous };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toastSuccess('Category deleted');
    },
    onError: (err, _id, context) => {
      if (context) {
        restoreSnapshot(queryClient, CATEGORIES_KEY, context.previous);
      }
      toastError('Failed to delete category', err.message);
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

  function handleRename(category: Category, name: string) {
    updateMutation.mutate({ id: category.id, name });
  }

  function handleConfirmDelete() {
    if (deletingCategory) {
      deleteMutation.mutate(deletingCategory.id);
    }
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[10px] text-muted-foreground">
            {total} {total === 1 ? 'category' : 'categories'}
          </p>
          <p className="text-xs text-muted-foreground">
            Double-click a category to rename · hit Enter to save · hover the ✕
            to delete
          </p>
        </div>
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
        <motion.div
          className="flex flex-wrap gap-2"
          variants={staggerContainer}
          initial={reduceMotion ? 'show' : 'hidden'}
          animate="show"
        >
          {items.map((category) => {
            const isRowPending =
              pendingRowId === category.id ||
              (updateMutation.isPending &&
                updateMutation.variables?.id === category.id);
            return (
              <motion.div key={category.id} variants={fadeUpItem}>
                <CategoryRow
                  category={category}
                  isPending={isRowPending}
                  onRename={handleRename}
                  onDeleteClick={setDeletingCategory}
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialName={draftName ?? undefined}
        isSaving={createMutation.isPending}
        onSave={handleSave}
      />

      <ConfirmDeleteCategoryDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCategory(null);
          }
        }}
        category={deletingCategory}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-md border border-border bg-card px-3 py-1.5"
        >
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}
