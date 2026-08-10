'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageCircleQuestionIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { FaqRow } from '@/components/sections/content/faqs/faq-row';
import { listFaqs } from '@/lib/api/content/faqs';

const FAQS_KEY = ['content', 'faqs'] as const;

type ActiveFilter = boolean | undefined;

const STATUS_TABS: { value: ActiveFilter; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
];

export function FaqsList() {
  const [isActive, setIsActive] = useState<ActiveFilter>(undefined);

  const { data, error, isPending, refetch } = useQuery({
    queryKey: FAQS_KEY,
    queryFn: listFaqs,
  });

  const items =
    data?.items.filter((faq) =>
      isActive === undefined ? true : faq.isActive === isActive,
    ) ?? [];
  const total = data?.items.length ?? 0;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          FAQs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilot page questions. Both languages are required before a question
          can go live.
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
        />
      ) : (
        <div className="divide-y divide-border border border-border bg-card">
          {items.map((faq, index) => (
            <FaqRow key={faq.id} faq={faq} index={index} />
          ))}
        </div>
      )}
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
