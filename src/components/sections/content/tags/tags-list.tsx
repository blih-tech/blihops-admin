'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TagIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { TagRow } from '@/components/sections/content/tags/tag-row';
import { TagFormDialog } from '@/components/sections/content/tags/tag-form-dialog';
import { ConfirmDeleteTagDialog } from '@/components/sections/content/tags/confirm-delete-tag-dialog';
import {
  createTag,
  deleteTag,
  listTags,
  updateTag,
  type TagsResponse,
  type Tag,
} from '@/lib/api/content/tags';
import { restoreSnapshot, takeSnapshot } from '@/lib/query/optimistic';
import { toastError, toastSuccess } from '@/lib/toast';

const TAGS_KEY = ['content', 'tags'] as const;

export function TagsList() {
  const queryClient = useQueryClient();
  const { data, error, isPending, refetch } = useQuery({
    queryKey: TAGS_KEY,
    queryFn: listTags,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [draftName, setDraftName] = useState<string | null>(null);
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);

  const createMutation = useMutation({
    mutationFn: createTag,
    onMutate: async (payload) => {
      const previous = takeSnapshot<TagsResponse>(queryClient, TAGS_KEY);
      const tempId = `temp-${crypto.randomUUID()}`;
      const tempTag: Tag = { id: tempId, name: payload.name };
      queryClient.setQueryData<TagsResponse>(TAGS_KEY, (old) =>
        old
          ? { ...old, items: [...old.items, tempTag] }
          : { items: [tempTag], meta: {} },
      );
      setDraftName(payload.name);
      setPendingRowId(tempId);
      setFormOpen(false);
      return { previous, tempId };
    },
    onSuccess: (result, _payload, context) => {
      queryClient.setQueryData<TagsResponse>(TAGS_KEY, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((item) =>
                item.id === context.tempId ? result.data : item,
              ),
            }
          : old,
      );
      void queryClient.invalidateQueries({ queryKey: TAGS_KEY });
      toastSuccess('Tag added');
      setDraftName(null);
      setFormOpen(false);
    },
    onError: (err, _payload, context) => {
      if (context) {
        restoreSnapshot(queryClient, TAGS_KEY, context.previous);
      }
      setFormOpen(true);
      toastError('Failed to add tag', err.message);
    },
    onSettled: () => {
      setPendingRowId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateTag(id, { name }),
    onMutate: async ({ id, name }) => {
      const previous = takeSnapshot<TagsResponse>(queryClient, TAGS_KEY);
      queryClient.setQueryData<TagsResponse>(TAGS_KEY, (old) =>
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
      void queryClient.invalidateQueries({ queryKey: TAGS_KEY });
      toastSuccess('Tag renamed');
    },
    onError: (err, _variables, context) => {
      if (context) {
        restoreSnapshot(queryClient, TAGS_KEY, context.previous);
      }
      toastError('Failed to rename tag', err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onMutate: async (id) => {
      const previous = takeSnapshot<TagsResponse>(queryClient, TAGS_KEY);
      queryClient.setQueryData<TagsResponse>(TAGS_KEY, (old) =>
        old
          ? { ...old, items: old.items.filter((item) => item.id !== id) }
          : old,
      );
      setDeletingTag(null);
      return { previous };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TAGS_KEY });
      toastSuccess('Tag deleted');
    },
    onError: (err, _id, context) => {
      if (context) {
        restoreSnapshot(queryClient, TAGS_KEY, context.previous);
      }
      toastError('Failed to delete tag', err.message);
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

  function handleRename(tag: Tag, name: string) {
    updateMutation.mutate({ id: tag.id, name });
  }

  function handleConfirmDelete() {
    if (deletingTag) {
      deleteMutation.mutate(deletingTag.id);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Tags
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reusable labels shared by case studies and insights. Tags are
            optional on both.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon data-icon="inline-start" />
          Add tag
        </Button>
      </div>

      {!isPending && !error && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[10px] text-muted-foreground">
            {total} {total === 1 ? 'tag' : 'tags'}
          </p>
          <p className="text-xs text-muted-foreground">
            Double-click a tag to rename · hit Enter to save · hover the ✕ to
            delete
          </p>
        </div>
      )}

      {isPending ? (
        <TagsSkeleton />
      ) : error ? (
        <ErrorState
          title="Failed to load tags"
          message={error.message}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<TagIcon className="size-6" />}
          title="No tags yet"
          description="Create tags to label case studies and insights."
          action={
            <Button onClick={openCreate}>
              <PlusIcon data-icon="inline-start" />
              Add tag
            </Button>
          }
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((tag) => {
            const isRowPending =
              pendingRowId === tag.id ||
              (updateMutation.isPending &&
                updateMutation.variables?.id === tag.id);
            return (
              <TagRow
                key={tag.id}
                tag={tag}
                isPending={isRowPending}
                onRename={handleRename}
                onDeleteClick={setDeletingTag}
              />
            );
          })}
        </div>
      )}

      <TagFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialName={draftName ?? undefined}
        isSaving={createMutation.isPending}
        onSave={handleSave}
      />

      <ConfirmDeleteTagDialog
        open={Boolean(deletingTag)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTag(null);
          }
        }}
        tag={deletingTag}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function TagsSkeleton() {
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
