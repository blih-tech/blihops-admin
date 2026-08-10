'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlusIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LogoCard } from '@/components/sections/content/logos/logo-card';
import { LogoFormDialog } from '@/components/sections/content/logos/logo-form-dialog';
import { ConfirmDeleteDialog } from '@/components/sections/content/logos/confirm-delete-dialog';
import {
  createLogo,
  deleteLogo,
  listLogos,
  updateLogo,
  type LogosResponse,
  type Logo,
} from '@/lib/api/content/logos';
import { restoreSnapshot, takeSnapshot } from '@/lib/query/optimistic';
import { toastError, toastSuccess } from '@/lib/toast';
import type { LogoFormValues } from '@/lib/validators/logo';

const LOGOS_KEY = ['content', 'logos'] as const;

export function LogosGrid() {
  const queryClient = useQueryClient();
  const { data, error, isPending, refetch } = useQuery({
    queryKey: LOGOS_KEY,
    queryFn: listLogos,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState<Logo | null>(null);
  const [deletingLogo, setDeletingLogo] = useState<Logo | null>(null);
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);
  const [draftValues, setDraftValues] = useState<LogoFormValues | null>(null);

  function invalidateLogos() {
    return queryClient.invalidateQueries({ queryKey: LOGOS_KEY });
  }

  const createMutation = useMutation({
    mutationFn: createLogo,
    onMutate: async (values) => {
      const previous = takeSnapshot<LogosResponse>(queryClient, LOGOS_KEY);
      const tempId = `temp-${crypto.randomUUID()}`;
      const tempLogo: Logo = {
        id: tempId,
        imageUrl: values.imageUrl,
        alt: values.alt,
      };
      queryClient.setQueryData<LogosResponse>(LOGOS_KEY, (old) =>
        old
          ? { ...old, items: [...old.items, tempLogo] }
          : { items: [tempLogo], meta: {} },
      );
      setDraftValues(values);
      setPendingCardId(tempId);
      setFormOpen(false);
      return { previous, tempId };
    },
    onSuccess: (result, _values, context) => {
      queryClient.setQueryData<LogosResponse>(LOGOS_KEY, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((item) =>
                item.id === context.tempId ? result.data : item,
              ),
            }
          : old,
      );
      void invalidateLogos();
      toastSuccess('Logo added');
      setDraftValues(null);
      setFormOpen(false);
      setEditingLogo(null);
    },
    onError: (err, _values, context) => {
      if (context) {
        restoreSnapshot(queryClient, LOGOS_KEY, context.previous);
      }
      setFormOpen(true);
      toastError('Failed to add logo', err.message);
    },
    onSettled: () => {
      setPendingCardId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: LogoFormValues }) =>
      updateLogo(id, payload),
    onMutate: async ({ id, payload }) => {
      const previous = takeSnapshot<LogosResponse>(queryClient, LOGOS_KEY);
      queryClient.setQueryData<LogosResponse>(LOGOS_KEY, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((item) =>
                item.id === id ? { ...item, ...payload } : item,
              ),
            }
          : old,
      );
      setDraftValues(payload);
      setFormOpen(false);
      return { previous };
    },
    onSuccess: () => {
      void invalidateLogos();
      toastSuccess('Logo updated');
      setDraftValues(null);
      setFormOpen(false);
      setEditingLogo(null);
    },
    onError: (err, _variables, context) => {
      if (context) {
        restoreSnapshot(queryClient, LOGOS_KEY, context.previous);
      }
      setFormOpen(true);
      toastError('Failed to update logo', err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLogo,
    onMutate: async (id) => {
      const previous = takeSnapshot<LogosResponse>(queryClient, LOGOS_KEY);
      queryClient.setQueryData<LogosResponse>(LOGOS_KEY, (old) =>
        old
          ? { ...old, items: old.items.filter((item) => item.id !== id) }
          : old,
      );
      setDeletingLogo(null);
      return { previous };
    },
    onSuccess: () => {
      void invalidateLogos();
      toastSuccess('Logo deleted');
    },
    onError: (err, _id, context) => {
      if (context) {
        restoreSnapshot(queryClient, LOGOS_KEY, context.previous);
      }
      toastError('Failed to delete logo', err.message);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreate() {
    setDraftValues(null);
    setEditingLogo(null);
    setFormOpen(true);
  }

  function handleSave(values: LogoFormValues) {
    if (editingLogo) {
      updateMutation.mutate({ id: editingLogo.id, payload: values });
    } else {
      createMutation.mutate(values);
    }
  }

  function handleConfirmDelete() {
    if (deletingLogo) {
      deleteMutation.mutate(deletingLogo.id);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Trusted Logos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Logos shown on the home page. All logos are public and appear in the
            order they were added.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon data-icon="inline-start" />
          Add logo
        </Button>
      </div>

      {isPending ? (
        <LogosSkeleton />
      ) : error ? (
        <ErrorState
          title="Failed to load logos"
          message={error.message}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={<ImagePlusIcon className="size-6" />}
          title="No logos yet"
          description="Add your first trusted logo to show it on the home page."
          action={
            <Button onClick={openCreate}>
              <PlusIcon data-icon="inline-start" />
              Add logo
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {data.items.map((logo) => (
            <LogoCard
              key={logo.id}
              logo={logo}
              isPending={
                pendingCardId === logo.id ||
                (updateMutation.isPending &&
                  updateMutation.variables?.id === logo.id)
              }
              onEdit={(logoToEdit) => {
                setEditingLogo(logoToEdit);
                setFormOpen(true);
              }}
              onDelete={setDeletingLogo}
            />
          ))}
        </div>
      )}

      <LogoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        logo={editingLogo}
        initialValues={draftValues}
        isSaving={isSaving}
        onSave={handleSave}
      />
      <ConfirmDeleteDialog
        open={Boolean(deletingLogo)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingLogo(null);
          }
        }}
        logo={deletingLogo}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function LogosSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="rounded-md border bg-card p-3">
          <Skeleton className="aspect-[3/1] w-full rounded-md" />
          <Skeleton className="mt-3 h-4 w-2/3 rounded-md" />
        </div>
      ))}
    </div>
  );
}
