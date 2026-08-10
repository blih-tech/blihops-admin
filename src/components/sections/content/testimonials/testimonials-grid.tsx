'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquareQuoteIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { TestimonialCard } from '@/components/sections/content/testimonials/testimonial-card';
import { PrimaryTestimonialCard } from '@/components/sections/content/testimonials/primary-testimonial-card';
import { TestimonialFormDialog } from '@/components/sections/content/testimonials/testimonial-form-dialog';
import { ConfirmDeleteTestimonialDialog } from '@/components/sections/content/testimonials/confirm-delete-testimonial-dialog';
import {
  createTestimonial,
  deleteTestimonial,
  listTestimonials,
  updateTestimonial,
  type TestimonialsResponse,
  type Testimonial,
} from '@/lib/api/content/testimonials';
import { restoreSnapshot, takeSnapshot } from '@/lib/query/optimistic';
import { toastError, toastSuccess } from '@/lib/toast';
import type { TestimonialFormValues } from '@/lib/validators/testimonial';

const TESTIMONIALS_KEY = ['content', 'testimonials'] as const;

export function TestimonialsGrid() {
  const queryClient = useQueryClient();
  const { data, error, isPending, refetch } = useQuery({
    queryKey: TESTIMONIALS_KEY,
    queryFn: listTestimonials,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);
  const [deletingTestimonial, setDeletingTestimonial] =
    useState<Testimonial | null>(null);
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);
  const [draftValues, setDraftValues] = useState<TestimonialFormValues | null>(
    null,
  );

  const createMutation = useMutation({
    mutationFn: createTestimonial,
    onMutate: async (values) => {
      const previous = takeSnapshot<TestimonialsResponse>(
        queryClient,
        TESTIMONIALS_KEY,
      );
      const tempId = `temp-${crypto.randomUUID()}`;
      const tempTestimonial: Testimonial = {
        id: tempId,
        avatarUrl: values.avatarUrl,
        name: values.name,
        role: values.role,
        company: values.company,
        quote: values.quote,
        isPrimary: false,
      };
      queryClient.setQueryData<TestimonialsResponse>(TESTIMONIALS_KEY, (old) =>
        old
          ? { ...old, items: [...old.items, tempTestimonial] }
          : { items: [tempTestimonial], meta: {} },
      );
      setDraftValues(values);
      setPendingCardId(tempId);
      setFormOpen(false);
      return { previous, tempId };
    },
    onSuccess: (result, _values, context) => {
      queryClient.setQueryData<TestimonialsResponse>(TESTIMONIALS_KEY, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((item) =>
                item.id === context.tempId ? result.data : item,
              ),
            }
          : old,
      );
      void queryClient.invalidateQueries({ queryKey: TESTIMONIALS_KEY });
      toastSuccess('Testimonial added');
      setDraftValues(null);
      setFormOpen(false);
    },
    onError: (err, _values, context) => {
      if (context) {
        restoreSnapshot(queryClient, TESTIMONIALS_KEY, context.previous);
      }
      setFormOpen(true);
      toastError('Failed to add testimonial', err.message);
    },
    onSettled: () => {
      setPendingCardId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: TestimonialFormValues;
    }) => updateTestimonial(id, payload),
    onMutate: async ({ id, payload }) => {
      const previous = takeSnapshot<TestimonialsResponse>(
        queryClient,
        TESTIMONIALS_KEY,
      );
      queryClient.setQueryData<TestimonialsResponse>(TESTIMONIALS_KEY, (old) =>
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
      void queryClient.invalidateQueries({ queryKey: TESTIMONIALS_KEY });
      toastSuccess('Testimonial updated');
      setDraftValues(null);
      setFormOpen(false);
      setEditingTestimonial(null);
    },
    onError: (err, _variables, context) => {
      if (context) {
        restoreSnapshot(queryClient, TESTIMONIALS_KEY, context.previous);
      }
      setFormOpen(true);
      toastError('Failed to update testimonial', err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTestimonial,
    onMutate: async (id) => {
      const previous = takeSnapshot<TestimonialsResponse>(
        queryClient,
        TESTIMONIALS_KEY,
      );
      queryClient.setQueryData<TestimonialsResponse>(TESTIMONIALS_KEY, (old) =>
        old
          ? {
              ...old,
              items: old.items.filter((item) => item.id !== id),
            }
          : old,
      );
      setDeletingTestimonial(null);
      return { previous };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TESTIMONIALS_KEY });
      toastSuccess('Testimonial deleted');
    },
    onError: (err, _id, context) => {
      if (context) {
        restoreSnapshot(queryClient, TESTIMONIALS_KEY, context.previous);
      }
      toastError('Failed to delete testimonial', err.message);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreate() {
    setDraftValues(null);
    setEditingTestimonial(null);
    setFormOpen(true);
  }

  function openEdit(testimonial: Testimonial) {
    setDraftValues(null);
    setEditingTestimonial(testimonial);
    setFormOpen(true);
  }

  function handleSave(values: TestimonialFormValues) {
    if (editingTestimonial) {
      updateMutation.mutate({
        id: editingTestimonial.id,
        payload: values,
      });
    } else {
      createMutation.mutate(values);
    }
  }

  function handleConfirmDelete() {
    if (deletingTestimonial) {
      deleteMutation.mutate(deletingTestimonial.id);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Testimonials
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quotes shown on the home page. One testimonial is marked as primary
            and featured on the managed-outsourcing section.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon data-icon="inline-start" />
          Add testimonial
        </Button>
      </div>

      {isPending ? (
        <TestimonialsSkeleton />
      ) : error ? (
        <ErrorState
          title="Failed to load testimonials"
          message={error.message}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={<MessageSquareQuoteIcon className="size-6" />}
          title="No testimonials yet"
          description="Add your first testimonial to show client quotes on the home page."
          action={
            <Button onClick={openCreate}>
              <PlusIcon data-icon="inline-start" />
              Add testimonial
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((testimonial) => {
            const isCardPending =
              pendingCardId === testimonial.id ||
              (updateMutation.isPending &&
                updateMutation.variables?.id === testimonial.id);
            return testimonial.isPrimary ? (
              <div key={testimonial.id} className="md:col-span-2">
                <PrimaryTestimonialCard
                  testimonial={testimonial}
                  isPending={isCardPending}
                  onEdit={openEdit}
                  onDelete={setDeletingTestimonial}
                />
              </div>
            ) : (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                isPending={isCardPending}
                onEdit={openEdit}
                onDelete={setDeletingTestimonial}
              />
            );
          })}
        </div>
      )}

      <TestimonialFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        testimonial={editingTestimonial}
        initialValues={draftValues}
        isSaving={isSaving}
        onSave={handleSave}
      />
      <ConfirmDeleteTestimonialDialog
        open={Boolean(deletingTestimonial)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTestimonial(null);
          }
        }}
        testimonial={deletingTestimonial}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function TestimonialsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Skeleton className="h-48 rounded-none md:col-span-2" />
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-48 rounded-none" />
      ))}
    </div>
  );
}
