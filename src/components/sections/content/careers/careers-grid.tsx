'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BriefcaseIcon, PlusIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dots } from '@/components/shared/Dots';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { CareerCard } from '@/components/sections/content/careers/career-card';
import { CareerFormDialog } from '@/components/sections/content/careers/career-form-dialog';
import { CareerPreviewDialog } from '@/components/sections/content/careers/career-preview-dialog';
import { ConfirmDeleteCareerDialog } from '@/components/sections/content/careers/confirm-delete-career-dialog';
import {
  createCareer,
  deleteCareer,
  listCareers,
  updateCareer,
  type CareersResponse,
  type CareerListItem,
  type CreateCareerPayload,
} from '@/lib/api/content/careers';
import { restoreSnapshot, takeSnapshot } from '@/lib/query/optimistic';
import { toastError, toastSuccess } from '@/lib/toast';
import type { CareerFormValues } from '@/lib/validators/career';

const PAGE_SIZE = 12;
const LIST_KEY = ['content', 'careers'] as const;

type ActiveFilter = boolean | undefined;

const STATUS_TABS: { value: ActiveFilter; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
];

function buildPayload(values: CareerFormValues): CreateCareerPayload {
  const entries = (list: { value: string }[]) =>
    list.map((entry) => entry.value.trim()).filter((text) => text.length > 0);

  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    department: values.department.trim(),
    location: values.location.trim(),
    employmentType: values.employmentType.trim(),
    summary: values.summary.trim(),
    overview: entries(values.overview),
    responsibilities: entries(values.responsibilities),
    requirements: entries(values.requirements),
  };
}

export function CareersGrid() {
  const queryClient = useQueryClient();
  const [isActive, setIsActive] = useState<ActiveFilter>(undefined);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<CareerListItem | null>(
    null,
  );
  const [previewCareer, setPreviewCareer] = useState<CareerListItem | null>(
    null,
  );
  const [deletingCareer, setDeletingCareer] = useState<CareerListItem | null>(
    null,
  );
  const [draftValues, setDraftValues] = useState<CareerFormValues | null>(null);
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);

  const listQueryKey = [
    'content',
    'careers',
    'admin',
    { page, pageSize: PAGE_SIZE, isActive },
  ] as const;

  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: listQueryKey,
    queryFn: () => listCareers({ page, pageSize: PAGE_SIZE, isActive }),
  });

  function selectFilter(next: ActiveFilter) {
    setIsActive(next);
    setPage(1);
  }

  const createMutation = useMutation({
    mutationFn: (values: CareerFormValues) =>
      createCareer(buildPayload(values)),
    onMutate: async (values) => {
      const previous = takeSnapshot<CareersResponse>(queryClient, listQueryKey);
      const tempId = `temp-${crypto.randomUUID()}`;
      const tempCareer: CareerListItem = {
        id: tempId,
        title: values.title,
        slug: values.slug,
        department: values.department,
        location: values.location,
        employmentType: values.employmentType,
        summary: values.summary,
        isActive: false,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<CareersResponse>(listQueryKey, (old) =>
        old
          ? { ...old, items: [tempCareer, ...old.items] }
          : {
              items: [tempCareer],
              meta: { page: 1, pageSize: PAGE_SIZE, total: 1, totalPages: 1 },
            },
      );
      setDraftValues(values);
      setPendingCardId(tempId);
      setFormOpen(false);
      return { previous, tempId };
    },
    onSuccess: (result, _values, context) => {
      queryClient.setQueryData<CareersResponse>(listQueryKey, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((item) =>
                item.id === context.tempId
                  ? {
                      id: result.data.id,
                      title: result.data.title,
                      slug: result.data.slug,
                      department: result.data.department,
                      location: result.data.location,
                      employmentType: result.data.employmentType,
                      summary: result.data.summary,
                      isActive: result.data.isActive,
                      createdAt: result.data.createdAt,
                    }
                  : item,
              ),
            }
          : old,
      );
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
      toastSuccess('Career role created');
      setDraftValues(null);
      setFormOpen(false);
    },
    onError: (err, _values, context) => {
      if (context) {
        restoreSnapshot(queryClient, listQueryKey, context.previous);
      }
      setFormOpen(true);
      toastError('Failed to create career role', err.message);
    },
    onSettled: () => {
      setPendingCardId(null);
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: CareerFormValues }) =>
      updateCareer(id, buildPayload(values)),
    onMutate: async ({ id, values }) => {
      const previous = takeSnapshot<CareersResponse>(queryClient, listQueryKey);
      queryClient.setQueryData<CareersResponse>(listQueryKey, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((item) =>
                item.id === id
                  ? {
                      ...item,
                      title: values.title.trim(),
                      slug: values.slug.trim(),
                      department: values.department.trim(),
                      location: values.location.trim(),
                      employmentType: values.employmentType.trim(),
                      summary: values.summary.trim(),
                    }
                  : item,
              ),
            }
          : old,
      );
      setDraftValues(values);
      setFormOpen(false);
      return { previous };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
      toastSuccess('Career role updated');
      setDraftValues(null);
      setFormOpen(false);
      setEditingCareer(null);
    },
    onError: (err, _variables, context) => {
      if (context) {
        restoreSnapshot(queryClient, listQueryKey, context.previous);
      }
      setFormOpen(true);
      toastError('Failed to update career role', err.message);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateCareer(id, { isActive }),
    onMutate: async ({ id, isActive }) => {
      const previous = takeSnapshot<CareersResponse>(queryClient, listQueryKey);
      queryClient.setQueryData<CareersResponse>(listQueryKey, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((item) =>
                item.id === id ? { ...item, isActive } : item,
              ),
            }
          : old,
      );
      return { previous };
    },
    onSuccess: (result, variables) => {
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
      toastSuccess(variables.isActive ? 'Role activated' : 'Role deactivated');
    },
    onError: (err, _variables, context) => {
      if (context) {
        restoreSnapshot(queryClient, listQueryKey, context.previous);
      }
      toastError('Failed to update role status', err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCareer,
    onMutate: async (id) => {
      const previous = takeSnapshot<CareersResponse>(queryClient, listQueryKey);
      queryClient.setQueryData<CareersResponse>(listQueryKey, (old) =>
        old
          ? { ...old, items: old.items.filter((item) => item.id !== id) }
          : old,
      );
      setDeletingCareer(null);
      return { previous };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
      toastSuccess('Career role deleted');
    },
    onError: (err, _id, context) => {
      if (context) {
        restoreSnapshot(queryClient, listQueryKey, context.previous);
      }
      toastError('Failed to delete career role', err.message);
    },
  });

  function openCreate() {
    setDraftValues(null);
    setEditingCareer(null);
    setFormOpen(true);
  }

  function openEdit(career: CareerListItem) {
    setDraftValues(null);
    setEditingCareer(career);
    setFormOpen(true);
  }

  function handleSave(values: CareerFormValues) {
    if (editingCareer) {
      editMutation.mutate({ id: editingCareer.id, values });
    } else {
      createMutation.mutate(values);
    }
  }

  function handlePreview(career: CareerListItem) {
    setPreviewCareer(career);
  }

  function handleEdit(career: CareerListItem) {
    openEdit(career);
  }

  function handleToggleActive(career: CareerListItem) {
    toggleMutation.mutate({ id: career.id, isActive: !career.isActive });
  }

  function handleDelete(career: CareerListItem) {
    setDeletingCareer(career);
  }

  function handleConfirmDelete() {
    if (deletingCareer) {
      deleteMutation.mutate(deletingCareer.id);
    }
  }

  const items = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const hasMore = data ? page < data.meta.totalPages : false;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Careers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            English-only roles shown on the website. Only active roles are
            public.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon data-icon="inline-start" />
          Add role
        </Button>
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
          action={
            <Button onClick={openCreate}>
              <PlusIcon data-icon="inline-start" />
              Add role
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {items.map((career) => {
              const isRowPending =
                pendingCardId === career.id ||
                (editMutation.isPending &&
                  editMutation.variables?.id === career.id) ||
                (toggleMutation.isPending &&
                  toggleMutation.variables?.id === career.id);
              return (
                <CareerCard
                  key={career.id}
                  career={career}
                  isPending={isRowPending}
                  onPreview={handlePreview}
                  onEdit={handleEdit}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                />
              );
            })}
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

      <CareerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        career={editingCareer}
        initialValues={draftValues}
        isSaving={createMutation.isPending || editMutation.isPending}
        onSave={handleSave}
      />

      <CareerPreviewDialog
        open={Boolean(previewCareer)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewCareer(null);
          }
        }}
        career={previewCareer}
      />

      <ConfirmDeleteCareerDialog
        open={Boolean(deletingCareer)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCareer(null);
          }
        }}
        career={deletingCareer}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function CareersSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
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
