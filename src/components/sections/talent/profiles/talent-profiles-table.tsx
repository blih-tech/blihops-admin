'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'motion/react';
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  EyeOffIcon,
  InboxIcon,
  MailIcon,
  PencilIcon,
  PowerIcon,
  PowerOffIcon,
  SearchIcon,
  SendIcon,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Dots } from '@/components/shared/Dots';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  staggerContainer,
  fadeUpItem,
} from '@/components/shared/motion-variants';
import {
  deactivateTalent,
  hideTalentProfile,
  listTalentProfiles,
  reactivateTalent,
  resendTalentInvitation,
  showTalentProfile,
  updateTalentProfile,
  type TalentAccountStatus,
  type TalentProfileListItem,
  type TalentProfileVisibility,
  TALENT_ACCOUNT_STATUSES,
  TALENT_PROFILE_VISIBILITIES,
} from '@/lib/api/talent/profiles';
import { toastError, toastSuccess } from '@/lib/toast';
import { TalentProfileDetailsDialog } from './talent-profile-details-dialog';
import { EditProfileDialog } from './edit-profile-dialog';
import type { UpdateTalentProfileValues } from '@/lib/validators/talent';

export const TALENT_PROFILES_KEY = ['talent-profiles'] as const;

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const VISIBILITY_BADGE: Record<
  TalentProfileVisibility,
  { label: string; className: string }
> = {
  HIDDEN: {
    label: 'Hidden',
    className: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-600',
  },
  VISIBLE: {
    label: 'Visible',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600',
  },
};

const ACCOUNT_BADGE: Record<
  TalentAccountStatus,
  { label: string; className: string }
> = {
  PENDING_INVITATION: {
    label: 'Pending invitation',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-600',
  },
  ACTIVE: {
    label: 'Active',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600',
  },
  DEACTIVATED: {
    label: 'Deactivated',
    className: 'border-destructive/20 bg-destructive/10 text-destructive',
  },
};

const badge =
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
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 2) pages.push('ellipsis-start');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push('ellipsis-end');
  pages.push(totalPages);
  return pages;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay)
    return d.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function TalentProfilesTable() {
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();
  const [detailsItem, setDetailsItem] = useState<TalentProfileListItem | null>(
    null,
  );
  const [editTarget, setEditTarget] = useState<TalentProfileListItem | null>(
    null,
  );
  const [confirmAction, setConfirmAction] = useState<{
    type: 'show' | 'hide' | 'deactivate' | 'reactivate' | 'resend';
    item: TalentProfileListItem;
  } | null>(null);

  const [visibilityFilter, setVisibilityFilter] = useState<
    TalentProfileVisibility | 'ALL'
  >('ALL');
  const [accountFilter, setAccountFilter] = useState<
    TalentAccountStatus | 'ALL'
  >('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);

  const hasActiveFilters =
    q.length > 0 || visibilityFilter !== 'ALL' || accountFilter !== 'ALL';
  const queryKey = [
    'talent-profiles',
    { visibility: visibilityFilter, accountStatus: accountFilter, q, page },
  ] as const;

  const { data, error, isPending, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      listTalentProfiles({
        visibility: visibilityFilter === 'ALL' ? undefined : visibilityFilter,
        accountStatus: accountFilter === 'ALL' ? undefined : accountFilter,
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
    setVisibilityFilter('ALL');
    setAccountFilter('ALL');
    setSearchInput('');
    setPage(1);
  }

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => updateTalentProfile(id, payload as never),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TALENT_PROFILES_KEY });
      if (editTarget)
        void queryClient.invalidateQueries({
          queryKey: ['talent-profiles', 'detail', editTarget.id],
        });
      toastSuccess('Profile updated');
      setEditTarget(null);
    },
    onError: (err: Error) => toastError('Failed to update', err.message),
  });

  const showMutation = useMutation({
    mutationFn: (id: string) => showTalentProfile(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TALENT_PROFILES_KEY });
      toastSuccess('Profile is now visible');
      setConfirmAction(null);
    },
    onError: (err: Error) => toastError('Failed to publish', err.message),
  });
  const hideMutation = useMutation({
    mutationFn: (id: string) => hideTalentProfile(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TALENT_PROFILES_KEY });
      toastSuccess('Profile hidden');
      setConfirmAction(null);
    },
    onError: (err: Error) => toastError('Failed to hide', err.message),
  });
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateTalent(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TALENT_PROFILES_KEY });
      toastSuccess('Talent deactivated');
      setConfirmAction(null);
    },
    onError: (err: Error) => toastError('Failed to deactivate', err.message),
  });
  const reactivateMutation = useMutation({
    mutationFn: (id: string) => reactivateTalent(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TALENT_PROFILES_KEY });
      toastSuccess('Talent reactivated');
      setConfirmAction(null);
    },
    onError: (err: Error) => toastError('Failed to reactivate', err.message),
  });
  const resendMutation = useMutation({
    mutationFn: (id: string) => resendTalentInvitation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TALENT_PROFILES_KEY });
      toastSuccess('Invitation resent');
      setConfirmAction(null);
    },
    onError: (err: Error) => toastError('Failed to resend', err.message),
  });

  const isConfirmPending =
    showMutation.isPending ||
    hideMutation.isPending ||
    deactivateMutation.isPending ||
    reactivateMutation.isPending ||
    resendMutation.isPending;

  function handleConfirm() {
    if (!confirmAction) return;
    const id = confirmAction.item.id;
    if (confirmAction.type === 'show') showMutation.mutate(id);
    if (confirmAction.type === 'hide') hideMutation.mutate(id);
    if (confirmAction.type === 'deactivate') deactivateMutation.mutate(id);
    if (confirmAction.type === 'reactivate') reactivateMutation.mutate(id);
    if (confirmAction.type === 'resend') resendMutation.mutate(id);
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Talent Profiles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage verified talent, visibility and account lifecycle.
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
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, role, email"
            aria-label="Search profiles"
          />
          {searchInput.length > 0 && (
            <InputGroupAddon align="inline-end">
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setPage(1);
                }}
                className="cursor-pointer rounded-sm p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <XIcon className="size-4" />
              </button>
            </InputGroupAddon>
          )}
        </InputGroup>

        <Select
          value={visibilityFilter}
          onValueChange={(v) => {
            setVisibilityFilter(v as never);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All visibility</SelectItem>
            {TALENT_PROFILE_VISIBILITIES.map((v) => (
              <SelectItem key={v} value={v}>
                {VISIBILITY_BADGE[v].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={accountFilter}
          onValueChange={(v) => {
            setAccountFilter(v as never);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All accounts</SelectItem>
            {TALENT_ACCOUNT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {ACCOUNT_BADGE[s].label}
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
            {total} {total === 1 ? 'profile' : 'profiles'}{' '}
            {q.length > 0 ? `· “${q}”` : ''}
          </p>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Seniority</TableHead>
            <TableHead>English</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        {isPending ? (
          <TableBody>
            <SkeletonRows rows={8} />
          </TableBody>
        ) : error ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} className="p-0">
                <ErrorState
                  title="Failed to load profiles"
                  message={error.message}
                  onRetry={() => void refetch()}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        ) : items.length === 0 ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} className="p-0">
                {hasActiveFilters ? (
                  <EmptyState
                    icon={<SearchIcon className="size-6" />}
                    title="No profiles match your filters"
                    description="Try a different search or widen visibility / account filters."
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
                    title="No profiles yet"
                    description="Profiles appear after creating one from an application in COMPLETION_SUBMITTED."
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
            {items.map((item) => (
              <motion.tr
                key={item.id}
                variants={fadeUpItem}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setDetailsItem(item)}
              >
                <TableCell className="font-medium text-foreground">
                  {item.fullName}
                </TableCell>
                <TableCell className="max-w-[12rem] truncate">
                  {item.primaryRole}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.seniority}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.englishLevel}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  €{item.clientMonthlyRateEur}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      badge,
                      VISIBILITY_BADGE[item.visibility].className,
                    )}
                  >
                    {VISIBILITY_BADGE[item.visibility].label}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      badge,
                      ACCOUNT_BADGE[item.accountStatus].className,
                    )}
                  >
                    {ACCOUNT_BADGE[item.accountStatus].label}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(item.updatedAt)}
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
                      <span className="sr-only">Profile actions</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setDetailsItem(item)}
                        className="focus:bg-muted focus:text-foreground"
                      >
                        <EyeIcon /> Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEditTarget(item)}
                        className="focus:bg-muted focus:text-foreground"
                      >
                        <PencilIcon /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {item.visibility === 'HIDDEN' ? (
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmAction({ type: 'show', item })
                          }
                          className="focus:bg-muted focus:text-foreground"
                        >
                          <CheckCircleIcon /> Show (publish)
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmAction({ type: 'hide', item })
                          }
                          className="focus:bg-muted focus:text-foreground"
                        >
                          <EyeOffIcon /> Hide
                        </DropdownMenuItem>
                      )}
                      {item.accountStatus !== 'DEACTIVATED' ? (
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmAction({ type: 'deactivate', item })
                          }
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <PowerOffIcon /> Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmAction({ type: 'reactivate', item })
                          }
                          className="focus:bg-muted focus:text-foreground"
                        >
                          <PowerIcon /> Reactivate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() =>
                          setConfirmAction({ type: 'resend', item })
                        }
                        className="focus:bg-muted focus:text-foreground"
                      >
                        <SendIcon /> Resend invitation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </motion.tbody>
        )}
      </Table>

      {!isPending && !error && items.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <nav aria-label="Pagination" className="flex items-center gap-1">
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

      <TalentProfileDetailsDialog
        open={Boolean(detailsItem)}
        onOpenChange={(o) => {
          if (!o) setDetailsItem(null);
        }}
        profile={detailsItem}
      />

      <EditProfileDialog
        open={Boolean(editTarget)}
        onOpenChange={(o) => {
          if (!o) setEditTarget(null);
        }}
        profile={editTarget}
        isSaving={updateMutation.isPending}
        onSave={(values: UpdateTalentProfileValues) => {
          if (editTarget)
            updateMutation.mutate({
              id: editTarget.id,
              payload: values as never,
            });
        }}
      />

      <Dialog
        open={Boolean(confirmAction)}
        onOpenChange={(o) => {
          if (!o) setConfirmAction(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === 'show' && 'Publish profile?'}
              {confirmAction?.type === 'hide' && 'Hide profile?'}
              {confirmAction?.type === 'deactivate' && 'Deactivate talent?'}
              {confirmAction?.type === 'reactivate' && 'Reactivate talent?'}
              {confirmAction?.type === 'resend' && 'Resend invitation?'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === 'show' &&
                'This will make the profile visible to clients.'}
              {confirmAction?.type === 'hide' &&
                'This will hide the profile from clients.'}
              {confirmAction?.type === 'deactivate' &&
                'Talent will be hidden and account deactivated. They cannot sign in.'}
              {confirmAction?.type === 'reactivate' &&
                'Account will be reactivated.'}
              {confirmAction?.type === 'resend' &&
                `An invitation email will be (re)sent to ${confirmAction.item.fullName}. Previous pending invitation will be replaced.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmAction(null)}
              disabled={isConfirmPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isConfirmPending}
              variant={
                confirmAction?.type === 'deactivate' ? 'destructive' : 'default'
              }
            >
              {isConfirmPending ? (
                <Dots dots={3} />
              ) : confirmAction?.type === 'show' ? (
                'Publish'
              ) : confirmAction?.type === 'hide' ? (
                'Hide'
              ) : confirmAction?.type === 'deactivate' ? (
                'Deactivate'
              ) : confirmAction?.type === 'reactivate' ? (
                'Reactivate'
              ) : (
                'Resend'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SkeletonRows({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-28 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-14 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-full" />
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
