'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderOpenIcon, PlusIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dots } from '@/components/shared/Dots';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { CaseStudyCard } from '@/components/sections/content/case-studies/case-study-card';
import { ConfirmDeleteCaseStudyDialog } from '@/components/sections/content/case-studies/confirm-delete-case-study-dialog';
import {
  deleteCaseStudy,
  listCaseStudies,
  publishCaseStudy,
  type CaseStudyListItem,
  type CaseStudiesResponse,
} from '@/lib/api/content/case-studies';
import { restoreSnapshot, takeSnapshot } from '@/lib/query/optimistic';
import { toastError, toastInfo, toastSuccess } from '@/lib/toast';

const PAGE_SIZE = 12;
const LIST_KEY = ['content', 'case-studies'] as const;

type StatusFilter = 'DRAFT' | 'PUBLISHED' | undefined;

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
];

export function CaseStudiesGrid() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<StatusFilter>(undefined);
  const [page, setPage] = useState(1);
  const [deletingCaseStudy, setDeletingCaseStudy] =
    useState<CaseStudyListItem | null>(null);

  const listQueryKey = [
    'content',
    'case-studies',
    'admin',
    { page, pageSize: PAGE_SIZE, status },
  ] as const;

  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: listQueryKey,
    queryFn: () => listCaseStudies({ page, pageSize: PAGE_SIZE, status }),
  });

  function selectStatus(next: StatusFilter) {
    setStatus(next);
    setPage(1);
  }

  const publishMutation = useMutation({
    mutationFn: publishCaseStudy,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
      toastSuccess('Case study published');
    },
    onError: (err) => {
      toastError('Failed to publish', err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCaseStudy,
    onMutate: async (id) => {
      const previous = takeSnapshot<CaseStudiesResponse>(
        queryClient,
        listQueryKey,
      );
      queryClient.setQueryData<CaseStudiesResponse>(listQueryKey, (old) =>
        old
          ? { ...old, items: old.items.filter((item) => item.id !== id) }
          : old,
      );
      setDeletingCaseStudy(null);
      return { previous };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
      toastSuccess('Case study deleted');
    },
    onError: (err, _id, context) => {
      if (context) {
        restoreSnapshot(queryClient, listQueryKey, context.previous);
      }
      toastError('Failed to delete case study', err.message);
    },
  });

  function handlePreview(caseStudy: CaseStudyListItem) {
    toastInfo(
      'Preview is not built yet',
      `“${caseStudy.titles.en || caseStudy.titles.de || caseStudy.client}”`,
    );
  }

  function handleEdit(caseStudy: CaseStudyListItem) {
    router.push(`/content/case-studies/${caseStudy.id}`);
  }

  function handlePublish(caseStudy: CaseStudyListItem) {
    publishMutation.mutate(caseStudy.id);
  }

  function handleDelete(caseStudy: CaseStudyListItem) {
    setDeletingCaseStudy(caseStudy);
  }

  function handleConfirmDelete() {
    if (deletingCaseStudy) {
      deleteMutation.mutate(deletingCaseStudy.id);
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
            Case Studies
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bilingual case studies shown on the website. Both English and German
            are required before publishing.
          </p>
        </div>
        <Button onClick={() => router.push('/content/case-studies/new')}>
          <PlusIcon data-icon="inline-start" />
          Add case study
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
          {STATUS_TABS.map((tab) => {
            const isActive = status === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectStatus(tab.value)}
                className={cn(
                  'cursor-pointer rounded-sm px-3 py-1.5 font-sans text-xs font-medium transition-colors',
                  isActive
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
            {total} {total === 1 ? 'case study' : 'case studies'}
          </p>
        )}
      </div>

      {isPending ? (
        <CaseStudiesSkeleton />
      ) : error ? (
        <ErrorState
          title="Failed to load case studies"
          message={error?.message}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<FolderOpenIcon className="size-6" />}
          title="No case studies yet"
          description="Add your first case study to showcase client work on the website."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {items.map((caseStudy) => (
              <CaseStudyCard
                key={caseStudy.id}
                caseStudy={caseStudy}
                isPending={
                  publishMutation.isPending &&
                  publishMutation.variables === caseStudy.id
                }
                onPreview={handlePreview}
                onEdit={handleEdit}
                onPublish={handlePublish}
                onDelete={handleDelete}
              />
            ))}
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

      <ConfirmDeleteCaseStudyDialog
        open={Boolean(deletingCaseStudy)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCaseStudy(null);
          }
        }}
        caseStudy={deletingCaseStudy}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function CaseStudiesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="border border-border bg-background p-4 sm:p-5"
        >
          <Skeleton className="aspect-video w-full rounded-md" />
          <Skeleton className="mt-4 h-3 w-1/3 rounded-md" />
          <Skeleton className="mt-3 h-6 w-2/3 rounded-md" />
          <Skeleton className="mt-3 h-4 w-full rounded-md" />
          <Skeleton className="mt-2 h-4 w-4/5 rounded-md" />
          <Skeleton className="mt-6 h-5 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}
