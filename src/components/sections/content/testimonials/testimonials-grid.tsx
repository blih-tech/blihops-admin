'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'motion/react';
import { MessageSquareQuoteIcon, PlusIcon, StarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
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
import {
  staggerContainer,
  fadeUpItem,
} from '@/components/shared/motion-variants';
import type { TestimonialFormValues } from '@/lib/validators/testimonial';

const TESTIMONIALS_KEY = ['content', 'testimonials'] as const;

export function TestimonialsGrid() {
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();
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
  const [draftValues, setDraftValues] = useState<
    (TestimonialFormValues & { makePrimary: boolean }) | null
  >(null);

  const hasPrimary = data?.items.some((item) => item.isPrimary) ?? false;

  const createMutation = useMutation({
    mutationFn: async ({
      payload,
      makePrimary,
    }: {
      payload: TestimonialFormValues;
      makePrimary: boolean;
    }) => {
      const created = await createTestimonial(payload);
      if (makePrimary) {
        await updateTestimonial(created.data.id, { isPrimary: true });
      }
      return created;
    },
    onMutate: async ({ payload, makePrimary }) => {
      const previous = takeSnapshot<TestimonialsResponse>(
        queryClient,
        TESTIMONIALS_KEY,
      );
      const tempId = `temp-${crypto.randomUUID()}`;
      const tempTestimonial: Testimonial = {
        id: tempId,
        avatarUrl: payload.avatarUrl,
        name: payload.name,
        role: payload.role,
        company: payload.company,
        quote: payload.quote,
        isPrimary: makePrimary,
      };
      queryClient.setQueryData<TestimonialsResponse>(TESTIMONIALS_KEY, (old) =>
        old
          ? { ...old, items: [...old.items, tempTestimonial] }
          : { items: [tempTestimonial], meta: {} },
      );
      setDraftValues({ ...payload, makePrimary });
      setPendingCardId(tempId);
      setFormOpen(false);
      return { previous, tempId, makePrimary };
    },
    onSuccess: (result, _variables, context) => {
      queryClient.setQueryData<TestimonialsResponse>(TESTIMONIALS_KEY, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((item) =>
                item.id === context.tempId
                  ? { ...result.data, isPrimary: context.makePrimary }
                  : item,
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
      makePrimary,
    }: {
      id: string;
      payload: TestimonialFormValues;
      makePrimary: boolean;
    }) =>
      updateTestimonial(
        id,
        makePrimary ? { ...payload, isPrimary: true } : payload,
      ),
    onMutate: async ({ id, payload, makePrimary }) => {
      const previous = takeSnapshot<TestimonialsResponse>(
        queryClient,
        TESTIMONIALS_KEY,
      );
      queryClient.setQueryData<TestimonialsResponse>(TESTIMONIALS_KEY, (old) =>
        old
          ? {
              ...old,
              items: makePrimary
                ? old.items.map((item) =>
                    item.id === id
                      ? { ...item, ...payload, isPrimary: true }
                      : { ...item, isPrimary: false },
                  )
                : old.items.map((item) =>
                    item.id === id ? { ...item, ...payload } : item,
                  ),
            }
          : old,
      );
      setDraftValues({ ...payload, makePrimary });
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

  function handleSave(values: TestimonialFormValues, makePrimary: boolean) {
    if (editingTestimonial) {
      updateMutation.mutate({
        id: editingTestimonial.id,
        payload: values,
        makePrimary,
      });
    } else {
      createMutation.mutate({ payload: values, makePrimary });
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

      {data && data.items.length > 0 && !hasPrimary && (
        <Alert className="rounded-md">
          <StarIcon />
          <AlertTitle>No primary testimonial</AlertTitle>
          <AlertDescription>
            Choose one testimonial to feature on the managed-outsourcing
            section. Open a testimonial and check &ldquo;Make this the primary
            testimonial&rdquo;.
          </AlertDescription>
          <AlertAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEdit(data.items[0])}
            >
              Promote testimonial
            </Button>
          </AlertAction>
        </Alert>
      )}

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
        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          variants={staggerContainer}
          initial={reduceMotion ? 'show' : 'hidden'}
          animate="show"
        >
          {[...data.items]
            .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
            .map((testimonial) => {
              const isCardPending =
                pendingCardId === testimonial.id ||
                (updateMutation.isPending &&
                  updateMutation.variables?.id === testimonial.id);
              return (
                <motion.div
                  key={testimonial.id}
                  variants={fadeUpItem}
                  className="h-full"
                >
                  {testimonial.isPrimary ? (
                    <PrimaryTestimonialCard
                      testimonial={testimonial}
                      isPending={isCardPending}
                      onEdit={openEdit}
                      onDelete={setDeletingTestimonial}
                    />
                  ) : (
                    <TestimonialCard
                      testimonial={testimonial}
                      isPending={isCardPending}
                      onEdit={openEdit}
                      onDelete={setDeletingTestimonial}
                    />
                  )}
                </motion.div>
              );
            })}
        </motion.div>
      )}

      <TestimonialFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        testimonial={editingTestimonial}
        initialValues={draftValues}
        initialMakePrimary={draftValues?.makePrimary}
        hasPrimary={hasPrimary}
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
      <Skeleton className="h-48 rounded-none" />
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-48 rounded-none" />
      ))}
    </div>
  );
}
