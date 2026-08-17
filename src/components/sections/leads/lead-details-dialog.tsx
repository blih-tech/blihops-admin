'use client';

import { useQuery } from '@tanstack/react-query';
import { FileTextIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { getLead, type LeadListItem } from '@/lib/api/leads';

const DETAIL_LABELS: Record<string, string> = {
  topic: 'Topic',
  message: 'Message',
  locale: 'Locale',
  service: 'Service',
  challenge: 'Main challenge',
  volume: 'Volume',
  timeline: 'Timeline',
  context: 'Context',
  bookingTime: 'Booking time',
  bookingEndTime: 'Booking end',
  timezone: 'Timezone',
  bookingUrl: 'Booking URL',
  meetingUrl: 'Meeting link',
  cancelledAt: 'Cancelled at',
  hearAbout: 'How they heard',
  teamSize: 'Team size',
};

const LINK_KEYS = new Set(['bookingUrl', 'meetingUrl']);

type LeadDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: LeadListItem | null;
};

export function LeadDetailsDialog({
  open,
  onOpenChange,
  lead,
}: LeadDetailsDialogProps) {
  const { data, error, isPending } = useQuery({
    queryKey: ['leads', 'detail', lead?.id],
    queryFn: () => getLead(lead!.id),
    enabled: open && lead !== null,
  });

  const detail = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{lead?.fullName ?? 'Lead details'}</DialogTitle>
          <DialogDescription>
            {lead?.company ?? lead?.workEmail ?? ' '}
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex flex-col gap-3 py-2">
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/3 rounded-md" />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load lead details"
            message={error.message}
          />
        ) : detail ? (
          <div className="flex flex-col gap-6">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <DetailRow label="Type" value={detail.type} mono />
              <DetailRow label="Status" value={detail.status} mono />
              <DetailRow label="Full name" value={detail.fullName} />
              <DetailRow label="Email" value={detail.workEmail} />
              <DetailRow label="Company" value={detail.company ?? '—'} />
              <DetailRow
                label="Created"
                value={formatDateTime(detail.createdAt)}
              />
              {detail.calBookingUid !== null && (
                <DetailRow
                  label="Cal booking"
                  value={detail.calBookingUid}
                  mono
                />
              )}
            </dl>

            <Separator />

            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Submission details
              </h3>
              {Object.keys(detail.details).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No additional details.
                </p>
              ) : (
                <dl className="flex flex-col gap-4">
                  {Object.entries(detail.details).map(([key, value]) => (
                    <DetailRow
                      key={key}
                      label={DETAIL_LABELS[key] ?? key}
                      value={formatDetailValue(key, value)}
                      href={
                        LINK_KEYS.has(key) &&
                        typeof value === 'string' &&
                        value.length > 0
                          ? value
                          : undefined
                      }
                    />
                  ))}
                </dl>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<FileTextIcon className="size-6" />}
            title="No lead selected"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
  href,
}: {
  label: string;
  value: string;
  mono?: boolean;
  href?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={
          mono
            ? 'break-all font-mono text-sm text-foreground'
            : 'text-sm text-foreground'
        }
      >
        {href !== undefined ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="break-all text-primary underline-offset-4 hover:underline"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function formatDetailValue(key: string, value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) {
    return '—';
  }
  if (
    key === 'bookingTime' ||
    key === 'bookingEndTime' ||
    key === 'cancelledAt'
  ) {
    return formatDateTime(value);
  }
  return value;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
