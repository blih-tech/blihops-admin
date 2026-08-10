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
import {
  createFaq,
  listFaqs,
  type Faq,
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
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);

  const { data, error, isPending, refetch } = useQuery({
    queryKey: FAQS_KEY,
    queryFn: listFaqs,
  });

  const createMutation = useMutation({
    mutationFn: (values: FaqFormValues) =>
      createFaq({
        en: {
          question: values.en.question.trim(),
          answer: values.en.answer.trim(),
        },
        de: {
          question: values.de.question.trim(),
          answer: values.de.answer.trim(),
        },
        displayOrder: values.displayOrder,
      }),
    onMutate: async (values) => {
      const previous = takeSnapshot<FaqsResponse>(queryClient, FAQS_KEY);
      const tempId = `temp-${crypto.randomUUID()}`;
      const tempFaq: Faq = {
        id: tempId,
        isActive: false,
        displayOrder: values.displayOrder,
        content: {
          en: {
            question: values.en.question.trim(),
            answer: values.en.answer.trim(),
          },
          de: {
            question: values.de.question.trim(),
            answer: values.de.answer.trim(),
          },
        },
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
    setFormOpen(true);
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
          {items.map((faq, index) => (
            <FaqRow
              key={faq.id}
              faq={faq}
              index={index}
              isPending={pendingRowId === faq.id}
            />
          ))}
        </div>
      )}

      <FaqFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={draftValues}
        nextDisplayOrder={nextDisplayOrder}
        isSaving={createMutation.isPending}
        onSave={(values) => createMutation.mutate(values)}
      />
    </div>
  );
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
