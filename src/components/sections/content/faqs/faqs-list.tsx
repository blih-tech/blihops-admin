'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircleQuestionIcon, PlusIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { FaqRow } from '@/components/sections/content/faqs/faq-row';
import { FaqFormDialog } from '@/components/sections/content/faqs/faq-form-dialog';
import { ConfirmDeleteFaqDialog } from '@/components/sections/content/faqs/confirm-delete-faq-dialog';
import {
  createFaq,
  deleteFaq,
  listFaqs,
  updateFaq,
  type Faq,
  type FaqLocaleContent,
  type FaqsResponse,
} from '@/lib/api/content/faqs';
import { restoreSnapshot, takeSnapshot } from '@/lib/query/optimistic';
import { toastError, toastSuccess } from '@/lib/toast';
import type { FaqFormValues } from '@/lib/validators/faq';

const FAQS_KEY = ['content', 'faqs'] as const;

type ActiveFilter = boolean | undefined;

const STATUS_TABS: { value: ActiveFilter; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
];

export function FaqsList() {
  const queryClient = useQueryClient();
  const [isActive, setIsActive] = useState<ActiveFilter>(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [draftValues, setDraftValues] = useState<FaqFormValues | null>(null);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<Faq | null>(null);
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);

  const { data, error, isPending, refetch } = useQuery({
    queryKey: FAQS_KEY,
    queryFn: listFaqs,
  });

  const createMutation = useMutation({
    mutationFn: (values: FaqFormValues) =>
      createFaq(buildLocalePayload(values)),
    onMutate: async (values) => {
      const previous = takeSnapshot<FaqsResponse>(queryClient, FAQS_KEY);
      const tempId = `temp-${crypto.randomUUID()}`;
      const tempFaq: Faq = {
        id: tempId,
        isActive: false,
        displayOrder: values.displayOrder,
        content: buildLocaleContent(values),
      };
      queryClient.setQueryData<FaqsResponse>(FAQS_KEY, (old) =>
        old
          ? { ...old, items: [...old.items, tempFaq] }
          : {
              items: [tempFaq],
              meta: { page: 1, pageSize: 0, total: 1, totalPages: 1 },
            },
      );
      setDraftValues(values);
      setPendingRowId(tempId);
      setFormOpen(false);
      return { previous, tempId };
    },
    onSuccess: (result, _values, context) => {
      queryClient.setQueryData<FaqsResponse>(FAQS_KEY, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((item) =>
                item.id === context.tempId ? result.data : item,
              ),
            }
          : old,
      );
      void queryClient.invalidateQueries({ queryKey: FAQS_KEY });
      toastSuccess('Question added');
      setDraftValues(null);
      setFormOpen(false);
    },
    onError: (err, _values, context) => {
      if (context) {
        restoreSnapshot(queryClient, FAQS_KEY, context.previous);
      }
      setFormOpen(true);
      toastError('Failed to add question', err.message);
    },
    onSettled: () => {
      setPendingRowId(null);
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FaqFormValues }) =>
      updateFaq(id, buildLocalePayload(values)),
    onMutate: async ({ id, values }) => {
      const previous = takeSnapshot<FaqsResponse>(queryClient, FAQS_KEY);
      queryClient.setQueryData<FaqsResponse>(FAQS_KEY, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((item) =>
                item.id === id
                  ? {
                      ...item,
                      displayOrder: values.displayOrder,
                      content: buildLocaleContent(values),
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
      void queryClient.invalidateQueries({ queryKey: FAQS_KEY });
      toastSuccess('Question updated');
      setDraftValues(null);
      setFormOpen(false);
      setEditingFaq(null);
    },
    onError: (err, _variables, context) => {
      if (context) {
        restoreSnapshot(queryClient, FAQS_KEY, context.previous);
      }
      setFormOpen(true);
      toastError('Failed to update question', err.message);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateFaq(id, { isActive }),
    onMutate: async ({ id, isActive }) => {
      const previous = takeSnapshot<FaqsResponse>(queryClient, FAQS_KEY);
      queryClient.setQueryData<FaqsResponse>(FAQS_KEY, (old) =>
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
      void queryClient.invalidateQueries({ queryKey: FAQS_KEY });
      toastSuccess(
        variables.isActive ? 'Question activated' : 'Question deactivated',
      );
    },
    onError: (err, _variables, context) => {
      if (context) {
        restoreSnapshot(queryClient, FAQS_KEY, context.previous);
      }
      toastError('Failed to update question status', err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFaq,
    onMutate: async (id) => {
      const previous = takeSnapshot<FaqsResponse>(queryClient, FAQS_KEY);
      queryClient.setQueryData<FaqsResponse>(FAQS_KEY, (old) =>
        old
          ? { ...old, items: old.items.filter((item) => item.id !== id) }
          : old,
      );
      setDeletingFaq(null);
      return { previous };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FAQS_KEY });
      toastSuccess('Question deleted');
    },
    onError: (err, _id, context) => {
      if (context) {
        restoreSnapshot(queryClient, FAQS_KEY, context.previous);
      }
      toastError('Failed to delete question', err.message);
    },
  });

  const moveMutation = useMutation({
    mutationFn: (swap: {
      first: { id: string; displayOrder: number };
      second: { id: string; displayOrder: number };
    }) =>
      Promise.all([
        updateFaq(swap.first.id, { displayOrder: swap.first.displayOrder }),
        updateFaq(swap.second.id, { displayOrder: swap.second.displayOrder }),
      ]),
    onMutate: async (swap) => {
      const previous = takeSnapshot<FaqsResponse>(queryClient, FAQS_KEY);
      queryClient.setQueryData<FaqsResponse>(FAQS_KEY, (old) =>
        old
          ? {
              ...old,
              items: old.items
                .map((item) =>
                  item.id === swap.first.id
                    ? { ...item, displayOrder: swap.first.displayOrder }
                    : item.id === swap.second.id
                      ? { ...item, displayOrder: swap.second.displayOrder }
                      : item,
                )
                .sort(
                  (a, b) =>
                    a.displayOrder - b.displayOrder || a.id.localeCompare(b.id),
                ),
            }
          : old,
      );
      return { previous };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FAQS_KEY });
      toastSuccess('Order updated');
    },
    onError: (err, _swap, context) => {
      if (context) {
        restoreSnapshot(queryClient, FAQS_KEY, context.previous);
      }
      toastError('Failed to update order', err.message);
    },
  });

  const items =
    data?.items.filter((faq) =>
      isActive === undefined ? true : faq.isActive === isActive,
    ) ?? [];
  const total = data?.items.length ?? 0;
  const nextDisplayOrder =
    (data?.items.reduce((max, faq) => Math.max(max, faq.displayOrder), -1) ??
      -1) + 1;

  function openCreate() {
    setDraftValues(null);
    setEditingFaq(null);
    setFormOpen(true);
  }

  function openEdit(faq: Faq) {
    setDraftValues(null);
    setEditingFaq(faq);
    setFormOpen(true);
  }

  function handleSave(values: FaqFormValues) {
    if (editingFaq) {
      editMutation.mutate({ id: editingFaq.id, values });
    } else {
      createMutation.mutate(values);
    }
  }

  function handleConfirmDelete() {
    if (deletingFaq) {
      deleteMutation.mutate(deletingFaq.id);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            FAQs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pilot page questions. Both languages are required before a question
            can go live.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon data-icon="inline-start" />
          Add question
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
                onClick={() => setIsActive(tab.value)}
                className={cn(
                  'cursor-pointer rounded-sm px-3 py-1.5 font-mono text-xs font-semibold transition-colors',
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
            {total} {total === 1 ? 'question' : 'questions'}
          </p>
        )}
      </div>

      {isPending ? (
        <FaqsSkeleton />
      ) : error ? (
        <ErrorState
          title="Failed to load FAQs"
          message={error.message}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<MessageCircleQuestionIcon className="size-6" />}
          title={
            isActive === undefined ? 'No FAQs yet' : 'No FAQs in this state'
          }
          description={
            isActive === undefined
              ? 'Add questions to the Pilot page. Each question needs English and German content.'
              : 'No FAQs match the selected status.'
          }
          action={
            isActive === undefined ? (
              <Button onClick={openCreate}>
                <PlusIcon data-icon="inline-start" />
                Add question
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="divide-y divide-border border border-border bg-card">
          {items.map((faq, index) => {
            const isRowPending =
              pendingRowId === faq.id ||
              (editMutation.isPending &&
                editMutation.variables?.id === faq.id) ||
              (toggleMutation.isPending &&
                toggleMutation.variables?.id === faq.id);
            return (
              <FaqRow
                key={faq.id}
                faq={faq}
                index={index}
                isPending={isRowPending}
                onEdit={openEdit}
                onToggleActive={(row) =>
                  toggleMutation.mutate({
                    id: row.id,
                    isActive: !row.isActive,
                  })
                }
                onDelete={setDeletingFaq}
              />
            );
          })}
        </div>
      )}

      <FaqFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        faq={editingFaq}
        initialValues={draftValues}
        nextDisplayOrder={nextDisplayOrder}
        isSaving={createMutation.isPending || editMutation.isPending}
        onSave={handleSave}
      />

      <ConfirmDeleteFaqDialog
        open={Boolean(deletingFaq)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingFaq(null);
          }
        }}
        faq={deletingFaq}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function buildLocaleContent(values: FaqFormValues): {
  en: FaqLocaleContent;
  de: FaqLocaleContent;
} {
  return {
    en: {
      question: values.en.question.trim(),
      answer: values.en.answer.trim(),
    },
    de: {
      question: values.de.question.trim(),
      answer: values.de.answer.trim(),
    },
  };
}

function buildLocalePayload(values: FaqFormValues) {
  return {
    ...buildLocaleContent(values),
    displayOrder: values.displayOrder,
  };
}

function FaqsSkeleton() {
  return (
    <div className="divide-y divide-border border border-border bg-card">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="h-3 w-6 shrink-0 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/5 rounded-md" />
            <Skeleton className="h-3 w-2/5 rounded-md" />
          </div>
          <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}
