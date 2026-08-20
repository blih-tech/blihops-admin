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
  InboxIcon,
  MailIcon,
  SearchIcon,
  Trash2Icon,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dots } from '@/components/shared/Dots';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  staggerContainer,
  fadeUpItem,
} from '@/components/shared/motion-variants';
import {
  deleteLead,
  listLeads,
  updateLeadStatus,
  type LeadListItem,
  type LeadStatus,
  type LeadType,
} from '@/lib/api/leads';
import { restoreSnapshot, takeSnapshot } from '@/lib/query/optimistic';
import { toastError, toastSuccess } from '@/lib/toast';

import { ConfirmDeleteLeadDialog } from './confirm-delete-lead-dialog';
import { LeadDetailsDialog } from './lead-details-dialog';

export const LEADS_KEY = ['leads'] as const;

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type LeadListResponse = {
  items: LeadListItem[];
  meta: Record<string, unknown>;
};

const TYPE_BADGE: Record<LeadType, { label: string; className: string }> = {
  CONTACT: {
    label: 'Contact',
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-600',
  },
  PILOT: {
    label: 'Pilot',
    className: 'border-violet-500/30 bg-violet-500/10 text-violet-600',
  },
  CALL: {
    label: 'Call',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-600',
  },
};

const STATUS_BADGE: Record<LeadStatus, { label: string; className: string }> = {
  NEW: {
    label: 'New',
    className: 'border-border bg-muted text-muted-foreground',
  },
  CONTACTED: {
    label: 'Contacted',
    className: 'border-primary/20 bg-primary/10 text-primary',
  },
  CONVERTED: {
    label: 'Converted',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600',
  },
  CLOSED: {
    label: 'Closed',
    className: 'border-destructive/20 bg-destructive/10 text-destructive',
  },
};

const badgeClassName =
  'rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase';

const TYPE_TABS: { value: LeadType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'CONTACT', label: 'Contact' },
  { value: 'PILOT', label: 'Pilot' },
  { value: 'CALL', label: 'Call' },
];

const STATUS_TABS: { value: LeadStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'CLOSED', label: 'Closed' },
];

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

export function LeadsTable() {
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();
  const [detailsLead, setDetailsLead] = useState<LeadListItem | null>(null);
  const [deletingLead, setDeletingLead] = useState<LeadListItem | null>(null);
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<LeadType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);

  const hasActiveFilters =
    q.length > 0 || typeFilter !== 'ALL' || statusFilter !== 'ALL';

  const queryKey = [
    'leads',
    { type: typeFilter, status: statusFilter, q, page },
  ] as const;

  const { data, error, isPending, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      listLeads({
        type: typeFilter === 'ALL' ? undefined : typeFilter,
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

  function selectTypeFilter(next: LeadType | 'ALL') {
    setTypeFilter(next);
    setPage(1);
  }

  function selectStatusFilter(next: LeadStatus | 'ALL') {
    setStatusFilter(next);
    setPage(1);
  }

  function clearFilters() {
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setSearchInput('');
    setPage(1);
  }

  function clampPageAfterRemoval() {
    const current = queryClient.getQueryData<LeadListResponse>(queryKey);
    if (current === undefined) return;
    const pageCount =
      typeof current.meta.totalPages === 'number'
        ? Math.max(1, current.meta.totalPages)
        : 1;
    if (current.items.length === 0 && page > 1) {
      setPage(Math.max(1, page - 1));
    } else if (page > pageCount) {
      setPage(pageCount);
    }
  }

  const deleteMutation = useMutation({
    mutationFn: deleteLead,
    onMutate: async (id) => {
      const previous = takeSnapshot<LeadListResponse>(queryClient, queryKey);
      queryClient.setQueryData<LeadListResponse>(queryKey, (old) =>
        old
          ? { ...old, items: old.items.filter((item) => item.id !== id) }
          : old,
      );
      setDeletingLead(null);
      return { previous };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LEADS_KEY });
      toastSuccess('Lead deleted');
      clampPageAfterRemoval();
    },
    onError: (err, _id, context) => {
      if (context) {
        restoreSnapshot(queryClient, queryKey, context.previous);
      }
      toastError('Failed to delete lead', err.message);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      updateLeadStatus(id, status),
    onMutate: async ({ id, status }) => {
      const previous = takeSnapshot<LeadListResponse>(queryClient, queryKey);
      queryClient.setQueryData<LeadListResponse>(queryKey, (old) =>
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
      void queryClient.invalidateQueries({ queryKey: LEADS_KEY });
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

  function handleStatusChange(lead: LeadListItem, status: LeadStatus) {
    if (status !== lead.status && pendingStatusId !== lead.id) {
      statusMutation.mutate({ id: lead.id, status });
    }
  }

  function handleConfirmDelete() {
    if (deletingLead) {
      deleteMutation.mutate(deletingLead.id);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Leads
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inbound enquiries from the contact form, pilot form, and booked
            discovery calls.
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
            placeholder="Search name, email, company"
            aria-label="Search leads"
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

        <SegmentedTabs
          label="Filter by lead type"
          tabs={TYPE_TABS}
          active={typeFilter}
          onSelect={selectTypeFilter}
        />

        <SegmentedTabs
          label="Filter by status"
          tabs={STATUS_TABS}
          active={statusFilter}
          onSelect={selectStatusFilter}
        />

        {!isPending && !error && (
          <p className="ml-auto font-mono text-[10px] text-muted-foreground">
            {total} {total === 1 ? 'lead' : 'leads'}
            {q.length > 0 ? ` · “${q}”` : ''}
          </p>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Full name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        {isPending ? (
          <TableBody>
            <LeadsTableSkeleton rows={8} />
          </TableBody>
        ) : error ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <ErrorState
                  title="Failed to load leads"
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
              <TableCell colSpan={7} className="p-0">
                {hasActiveFilters ? (
                  <EmptyState
                    icon={<SearchIcon className="size-6" />}
                    title="No leads match your filters"
                    description="Try a different search term or widen the type and status filters."
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
                    title="No leads yet"
                    description="Leads from the contact form, pilot form, and booked calls will appear here."
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
            {items.map((lead) => {
              const status = STATUS_BADGE[lead.status];
              const isStatusPending = pendingStatusId === lead.id;
              return (
                <motion.tr
                  key={lead.id}
                  variants={fadeUpItem}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setDetailsLead(lead)}
                >
                  <TableCell className="font-medium text-foreground">
                    {lead.company ?? '—'}
                  </TableCell>
                  <TableCell>{lead.fullName}</TableCell>
                  <TableCell
                    className="text-muted-foreground"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <a
                      href={`mailto:${lead.workEmail}`}
                      className="inline-flex items-center gap-1.5 break-all underline-offset-4 hover:text-primary hover:underline"
                    >
                      <MailIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      {lead.workEmail}
                    </a>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        badgeClassName,
                        TYPE_BADGE[lead.type].className,
                      )}
                    >
                      {TYPE_BADGE[lead.type].label}
                    </span>
                  </TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        nativeButton={false}
                        disabled={isStatusPending}
                        render={
                          <span
                            className={cn(
                              badgeClassName,
                              status.className,
                              'inline-flex cursor-pointer items-center gap-1.5 transition-opacity hover:opacity-80',
                              isStatusPending &&
                                'pointer-events-none opacity-60',
                            )}
                          />
                        }
                      >
                        {isStatusPending ? <Dots dots={3} /> : status.label}
                        <span className="sr-only">
                          Change status for {lead.fullName}
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {(Object.keys(STATUS_BADGE) as LeadStatus[]).map(
                          (candidate) => (
                            <DropdownMenuItem
                              key={candidate}
                              disabled={
                                candidate === lead.status || isStatusPending
                              }
                              onClick={() =>
                                handleStatusChange(lead, candidate)
                              }
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
                              {candidate === lead.status ? (
                                <CheckIcon className="ml-auto size-3.5" />
                              ) : null}
                            </DropdownMenuItem>
                          ),
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(lead.createdAt)}
                  </TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
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
                        <span className="sr-only">Lead actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setDetailsLead(lead)}
                          className="focus:bg-muted focus:text-foreground"
                        >
                          <EyeIcon />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingLead(lead)}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Trash2Icon />
                          Delete
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
            aria-label="Lead list pagination"
            className="flex items-center gap-1"
          >
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
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
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={page >= totalPages}
              aria-label="Next page"
            >
              <ChevronRightIcon />
            </Button>
          </nav>
        </div>
      )}

      <LeadDetailsDialog
        open={Boolean(detailsLead)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailsLead(null);
          }
        }}
        lead={detailsLead}
      />

      <ConfirmDeleteLeadDialog
        open={Boolean(deletingLead)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingLead(null);
          }
        }}
        lead={deletingLead}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function SegmentedTabs<T extends string>({
  label,
  tabs,
  active,
  onSelect,
}: {
  label: string;
  tabs: { value: T; label: string }[];
  active: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-1 rounded-md border border-border bg-card p-1"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(tab.value)}
            className={cn(
              'cursor-pointer rounded-sm px-3 py-1.5 font-mono text-xs font-semibold transition-colors',
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
  );
}

function LeadsTableSkeleton({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-24 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-14 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-full" />
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
