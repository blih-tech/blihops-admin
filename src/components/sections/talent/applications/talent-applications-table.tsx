'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'motion/react';
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  FilePenLineIcon,
  InboxIcon,
  MailIcon,
  SearchIcon,
  SendIcon,
  UserPlusIcon,
  XIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dots } from '@/components/shared/Dots';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  staggerContainer,
  fadeUpItem,
} from '@/components/shared/motion-variants';
import {
  createTalentProfileFromApplication,
  getTalentApplication,
  listTalentApplications,
  sendTalentCompletionRequest,
  updateTalentApplicationNotes,
  updateTalentApplicationStatus,
  type TalentApplicationListItem,
  type TalentApplicationStatus,
  TALENT_APPLICATION_STATUSES,
} from '@/lib/api/talent/applications';
import { restoreSnapshot, takeSnapshot } from '@/lib/query/optimistic';
import { toastError, toastSuccess } from '@/lib/toast';
import { TalentApplicationDetailsDialog } from './talent-application-details-dialog';
import { EditNotesDialog } from './edit-notes-dialog';
import { SendCompletionRequestDialog } from './send-completion-request-dialog';
import { CreateProfileDialog } from './create-profile-dialog';
import type { CreateTalentProfileValues } from '@/lib/validators/talent';

export const TALENT_APPLICATIONS_KEY = ['talent-applications'] as const;

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type TalentApplicationListResponse = {
  items: TalentApplicationListItem[];
  meta: Record<string, unknown>;
};

const STATUS_BADGE: Record<
  TalentApplicationStatus,
  { label: string; className: string }
> = {
  NEW: {
    label: 'New',
    className: 'border-border bg-muted text-muted-foreground',
  },
  UNDER_REVIEW: {
    label: 'Under review',
    className: 'border-primary/20 bg-primary/10 text-primary',
  },
  SCREENING: {
    label: 'Screening',
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-600',
  },
  TECHNICAL_ASSESSMENT: {
    label: 'Technical',
    className: 'border-violet-500/30 bg-violet-500/10 text-violet-600',
  },
  ENGLISH_ASSESSMENT: {
    label: 'English',
    className: 'border-blue-500/30 bg-blue-500/10 text-blue-600',
  },
  REMOTE_READINESS_ASSESSMENT: {
    label: 'Remote readiness',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-600',
  },
  APPROVED: {
    label: 'Approved',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600',
  },
  COMPLETION_REQUESTED: {
    label: 'Completion requested',
    className: 'border-orange-500/30 bg-orange-500/10 text-orange-600',
  },
  COMPLETION_SUBMITTED: {
    label: 'Completion submitted',
    className: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600',
  },
  PROFILE_CREATED: {
    label: 'Profile created',
    className: 'border-teal-500/30 bg-teal-500/10 text-teal-600',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'border-destructive/20 bg-destructive/10 text-destructive',
  },
  ARCHIVED: {
    label: 'Archived',
    className: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-500',
  },
};

const badgeClassName =
  'rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase';

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
}

function paginationWindow(
  current: number,
  totalPages: number,
): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 2) pages.push('ellipsis-start');
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push('ellipsis-end');
  pages.push(totalPages);
  return pages;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return date.toLocaleString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function TalentApplicationsTable() {
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();
  const [detailsItem, setDetailsItem] =
    useState<TalentApplicationListItem | null>(null);
  const [notesTarget, setNotesTarget] =
    useState<TalentApplicationListItem | null>(null);
  const [completionTarget, setCompletionTarget] =
    useState<TalentApplicationListItem | null>(null);
  const [createProfileTarget, setCreateProfileTarget] =
    useState<TalentApplicationListItem | null>(null);
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    TalentApplicationStatus | 'ALL'
  >('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);

  const hasActiveFilters = q.length > 0 || statusFilter !== 'ALL';

  const queryKey = [
    'talent-applications',
    { status: statusFilter, q, page },
  ] as const;

  const { data, error, isPending, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      listTalentApplications({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        q: q.length > 0 ? q : undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
  });

  const items = data?.items ?? [];
  const meta: Record<string, unknown> = data?.meta ?? {};
  const total = typeof meta.total === 'number' ? meta.total : 0;
  const totalPages =
    typeof meta.totalPages === 'number' ? Math.max(1, meta.totalPages) : 1;

  function clearFilters() {
    setStatusFilter('ALL');
    setSearchInput('');
    setPage(1);
  }

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: TalentApplicationStatus;
    }) => updateTalentApplicationStatus(id, status),
    onMutate: async ({ id, status }) => {
      const previous = takeSnapshot<TalentApplicationListResponse>(
        queryClient,
        queryKey,
      );
      queryClient.setQueryData<TalentApplicationListResponse>(
        queryKey,
        (old) =>
          old
            ? {
                ...old,
                items: old.items.map((item) =>
                  item.id === id ? { ...item, status } : item,
                ),
              }
            : old,
      );
      setPendingStatusId(id);
      return { previous };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TALENT_APPLICATIONS_KEY,
      });
      toastSuccess('Status updated');
    },
    onError: (err, _vars, context) => {
      if (context) {
        restoreSnapshot(queryClient, queryKey, context.previous);
      }
      toastError('Failed to update status', err.message);
    },
    onSettled: () => {
      setPendingStatusId(null);
    },
  });

  const notesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      updateTalentApplicationNotes(id, notes),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TALENT_APPLICATIONS_KEY,
      });
      if (notesTarget) {
        void queryClient.invalidateQueries({
          queryKey: ['talent-applications', 'detail', notesTarget.id],
        });
      }
      toastSuccess('Notes saved');
      setNotesTarget(null);
    },
    onError: (err: Error) => {
      toastError('Failed to save notes', err.message);
    },
  });

  const completionMutation = useMutation({
    mutationFn: (id: string) => sendTalentCompletionRequest(id),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({
        queryKey: TALENT_APPLICATIONS_KEY,
      });
      toastSuccess(
        'Completion request sent',
        `Link expires ${new Date(res.data.expiresAt).toLocaleString('en-GB')}`,
      );
      setCompletionTarget(null);
    },
    onError: (err: Error) => {
      toastError('Failed to send request', err.message);
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: CreateTalentProfileValues;
    }) => createTalentProfileFromApplication(id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TALENT_APPLICATIONS_KEY,
      });
      void queryClient.invalidateQueries({
        queryKey: ['talent-profiles'],
      });
      toastSuccess('Talent profile created');
      setCreateProfileTarget(null);
    },
    onError: (err: Error) => {
      toastError('Failed to create profile', err.message);
    },
  });

  function handleStatusChange(
    item: TalentApplicationListItem,
    status: TalentApplicationStatus,
  ) {
    if (status !== item.status && pendingStatusId !== item.id) {
      statusMutation.mutate({ id: item.id, status });
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Talent Applications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review inbound talent applications, update pipeline status, and
            trigger profile creation.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <InputGroup className="w-full min-w-52 max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, role"
            aria-label="Search applications"
          />
          {searchInput.length > 0 && (
            <InputGroupAddon align="inline-end">
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setPage(1);
                }}
                className="cursor-pointer rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
              >
                <XIcon className="size-4" />
              </button>
            </InputGroupAddon>
          )}
        </InputGroup>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as TalentApplicationStatus | 'ALL');
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {TALENT_APPLICATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_BADGE[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}

        {!isPending && !error && (
          <p className="ml-auto font-mono text-[10px] text-muted-foreground">
            {total} {total === 1 ? 'application' : 'applications'}
            {q.length > 0 ? ` · “${q}”` : ''}
          </p>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        {isPending ? (
          <TableBody>
            <TalentApplicationsSkeleton rows={8} />
          </TableBody>
        ) : error ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="p-0">
                <ErrorState
                  title="Failed to load applications"
                  message={error.message}
                  onRetry={() => {
                    void refetch();
                  }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        ) : items.length === 0 ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="p-0">
                {hasActiveFilters ? (
                  <EmptyState
                    icon={<SearchIcon className="size-6" />}
                    title="No applications match your filters"
                    description="Try a different search term or widen the status filter."
                    action={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                      >
                        Clear filters
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState
                    icon={<InboxIcon className="size-6" />}
                    title="No applications yet"
                    description="New talent applications from /talent/apply will appear here."
                  />
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <motion.tbody
            variants={staggerContainer}
            initial={reduceMotion ? 'show' : 'hidden'}
            animate="show"
            className="[&_tr:last-child]:border-0"
          >
            {items.map((item) => {
              const badge = STATUS_BADGE[item.status];
              const isPendingStatus = pendingStatusId === item.id;
              return (
                <motion.tr
                  key={item.id}
                  variants={fadeUpItem}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setDetailsItem(item)}
                >
                  <TableCell className="font-medium text-foreground">
                    {item.fullName}
                  </TableCell>
                  <TableCell
                    className="text-muted-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a
                      href={`mailto:${item.workEmail}`}
                      className="inline-flex items-center gap-1.5 break-all underline-offset-4 hover:text-primary hover:underline"
                    >
                      <MailIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      {item.workEmail}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-[14rem] truncate">
                    {item.primaryRole}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.yearsExperience}y
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.city}, {item.country}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        nativeButton={false}
                        disabled={isPendingStatus}
                        render={
                          <span
                            className={cn(
                              badgeClassName,
                              badge.className,
                              'inline-flex cursor-pointer items-center gap-1.5 transition-opacity hover:opacity-80',
                              isPendingStatus &&
                                'pointer-events-none opacity-60',
                            )}
                          />
                        }
                      >
                        {isPendingStatus ? <Dots dots={3} /> : badge.label}
                        <span className="sr-only">
                          Change status for {item.fullName}
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {TALENT_APPLICATION_STATUSES.map((candidate) => (
                          <DropdownMenuItem
                            key={candidate}
                            disabled={
                              candidate === item.status || isPendingStatus
                            }
                            onClick={() => handleStatusChange(item, candidate)}
                            className="focus:bg-muted focus:text-foreground"
                          >
                            <span
                              className={cn(
                                'size-1.5 rounded-full',
                                STATUS_BADGE[candidate].className,
                              )}
                              aria-hidden="true"
                            />
                            {STATUS_BADGE[candidate].label}
                            {candidate === item.status ? (
                              <CheckIcon className="ml-auto size-3.5" />
                            ) : null}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                          />
                        }
                      >
                        <EllipsisVerticalIcon />
                        <span className="sr-only">Application actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setDetailsItem(item)}
                          className="focus:bg-muted focus:text-foreground"
                        >
                          <EyeIcon />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setNotesTarget(item)}
                          className="focus:bg-muted focus:text-foreground"
                        >
                          <FilePenLineIcon />
                          Edit notes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setCompletionTarget(item)}
                          className="focus:bg-muted focus:text-foreground"
                        >
                          <SendIcon />
                          Send completion request
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setCreateProfileTarget(item)}
                          className="focus:bg-muted focus:text-foreground"
                        >
                          <UserPlusIcon />
                          Create profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              );
            })}
          </motion.tbody>
        )}
      </Table>

      {!isPending && !error && items.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <nav
            aria-label="Application list pagination"
            className="flex items-center gap-1"
          >
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage((c) => Math.max(1, c - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeftIcon />
            </Button>
            {paginationWindow(page, totalPages).map((entry) =>
              entry === 'ellipsis-start' || entry === 'ellipsis-end' ? (
                <span
                  key={entry}
                  className="px-1 font-mono text-xs text-muted-foreground"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setPage(entry)}
                  aria-current={entry === page ? 'page' : undefined}
                  className={cn(
                    'min-w-8 cursor-pointer rounded-md border px-2.5 py-1.5 font-mono text-xs font-semibold transition-colors',
                    entry === page
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground',
                  )}
                >
                  {entry}
                </button>
              ),
            )}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage((c) => Math.min(totalPages, c + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
            >
              <ChevronRightIcon />
            </Button>
          </nav>
        </div>
      )}

      <TalentApplicationDetailsDialog
        open={Boolean(detailsItem)}
        onOpenChange={(open) => {
          if (!open) setDetailsItem(null);
        }}
        application={detailsItem}
      />

      <EditNotesDialog
        open={Boolean(notesTarget)}
        onOpenChange={(open) => {
          if (!open) setNotesTarget(null);
        }}
        application={notesTarget}
        isSaving={notesMutation.isPending}
        onSave={(values) => {
          if (notesTarget) {
            notesMutation.mutate({
              id: notesTarget.id,
              notes: values.internalNotes,
            });
          }
        }}
      />

      <SendCompletionRequestDialog
        open={Boolean(completionTarget)}
        onOpenChange={(open) => {
          if (!open) setCompletionTarget(null);
        }}
        application={completionTarget}
        isPending={completionMutation.isPending}
        onConfirm={() => {
          if (completionTarget) {
            completionMutation.mutate(completionTarget.id);
          }
        }}
      />

      <CreateProfileDialog
        open={Boolean(createProfileTarget)}
        onOpenChange={(open) => {
          if (!open) setCreateProfileTarget(null);
        }}
        application={createProfileTarget}
        isSaving={createProfileMutation.isPending}
        onSave={(values) => {
          if (createProfileTarget) {
            createProfileMutation.mutate({
              id: createProfileTarget.id,
              values,
            });
          }
        }}
      />
    </div>
  );
}

function TalentApplicationsSkeleton({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-28 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-36 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20 rounded-md" />
          </TableCell>
          <TableCell />
        </TableRow>
      ))}
    </>
  );
}
