'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  EyeIcon,
  InboxIcon,
  Trash2Icon,
  EllipsisVerticalIcon,
  CheckIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
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

export function LeadsTable() {
  const queryClient = useQueryClient();
  const [detailsLead, setDetailsLead] = useState<LeadListItem | null>(null);
  const [deletingLead, setDeletingLead] = useState<LeadListItem | null>(null);
  const [typeFilter, setTypeFilter] = useState<LeadType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');

  const queryKey = [
    'leads',
    { type: typeFilter, status: statusFilter },
  ] as const;

  const { data, error, isPending, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      listLeads({
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        pageSize: 100,
      }),
  });

  const items = data?.items ?? [];

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
  });

  function handleStatusChange(lead: LeadListItem, status: LeadStatus) {
    if (status !== lead.status) {
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

        <div className="flex items-center gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as LeadType | 'ALL')}
          >
            <SelectTrigger size="sm" className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="CONTACT">Contact</SelectItem>
              <SelectItem value="PILOT">Pilot</SelectItem>
              <SelectItem value="CALL">Call</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as LeadStatus | 'ALL')
            }
          >
            <SelectTrigger size="sm" className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="CONVERTED">Converted</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
        <TableBody>
          {isPending ? (
            <LeadsTableSkeleton rows={6} />
          ) : error ? (
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
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <EmptyState
                  icon={<InboxIcon className="size-6" />}
                  title="No leads yet"
                  description="Leads from the contact form, pilot form, and booked calls will appear here."
                />
              </TableCell>
            </TableRow>
          ) : (
            items.map((lead) => {
              const status = STATUS_BADGE[lead.status];
              return (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setDetailsLead(lead)}
                >
                  <TableCell className="font-medium text-foreground">
                    {lead.company ?? '—'}
                  </TableCell>
                  <TableCell>{lead.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.workEmail}
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
                        render={
                          <span
                            className={cn(
                              badgeClassName,
                              status.className,
                              'cursor-pointer transition-opacity hover:opacity-80',
                            )}
                          />
                        }
                      >
                        {status.label}
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
                                candidate === lead.status ||
                                statusMutation.isPending
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
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

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

function LeadsTableSkeleton({ rows }: { rows: number }) {
  return Array.from({ length: rows }).map((_, index) => (
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
  ));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
