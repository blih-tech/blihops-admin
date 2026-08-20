'use client';

import { useQuery } from '@tanstack/react-query';
import { ExternalLinkIcon, FileTextIcon } from 'lucide-react';

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
import {
  getTalentApplication,
  type TalentApplicationListItem,
} from '@/lib/api/talent/applications';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: TalentApplicationListItem | null;
};

export function TalentApplicationDetailsDialog({
  open,
  onOpenChange,
  application,
}: Props) {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ['talent-applications', 'detail', application?.id],
    queryFn: () => getTalentApplication(application!.id),
    enabled: open && application !== null,
  });

  const detail = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {application?.fullName ?? 'Application details'}
          </DialogTitle>
          <DialogDescription>
            {application?.workEmail ?? ''}{' '}
            {application ? `· ${application.primaryRole}` : ''}
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex flex-col gap-3 py-2">
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load details"
            message={error.message}
            onRetry={() => void refetch()}
          />
        ) : detail ? (
          <div className="flex flex-col gap-6">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <DetailRow label="Full name" value={detail.fullName} />
              <DetailRow
                label="Work email"
                value={detail.workEmail}
                href={`mailto:${detail.workEmail}`}
              />
              <DetailRow label="Phone" value={detail.phone} />
              <DetailRow
                label="Location"
                value={`${detail.city}, ${detail.country}`}
              />
              <DetailRow label="Primary role" value={detail.primaryRole} />
              <DetailRow
                label="Experience"
                value={`${detail.yearsExperience} years`}
              />
              <DetailRow label="Status" value={detail.status} mono />
              <DetailRow
                label="Created"
                value={new Date(detail.createdAt).toLocaleString('en-GB')}
              />
              <DetailRow
                label="Updated"
                value={new Date(detail.updatedAt).toLocaleString('en-GB')}
              />
              {detail.talentProfileId && (
                <DetailRow
                  label="Profile ID"
                  value={detail.talentProfileId}
                  mono
                />
              )}
            </dl>

            <Separator />

            <div className="flex flex-col gap-2">
              <h3 className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Tech stack
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {detail.techStack.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>
              {detail.secondarySkills.length > 0 && (
                <>
                  <h4 className="mt-2 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                    Secondary skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.secondarySkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Links & files
              </h3>
              <dl className="grid grid-cols-1 gap-3">
                <DetailRow
                  label="Portfolio"
                  value={detail.portfolioUrl ?? '—'}
                  href={detail.portfolioUrl ?? undefined}
                />
                <DetailRow
                  label="GitHub"
                  value={detail.githubUrl ?? '—'}
                  href={detail.githubUrl ?? undefined}
                />
                <DetailRow
                  label="LinkedIn"
                  value={detail.linkedinUrl ?? '—'}
                  href={detail.linkedinUrl ?? undefined}
                />
                <DetailRow
                  label="Resume fileKey"
                  value={detail.resumeFileKey}
                  mono
                />
              </dl>
            </div>

            {(detail.completionPhotoKey ||
              detail.completionShortBio ||
              detail.completionProfessionalHeadline) && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h3 className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    Completion submission
                  </h3>
                  <dl className="grid grid-cols-1 gap-3">
                    <DetailRow
                      label="Photo key"
                      value={detail.completionPhotoKey ?? '—'}
                      mono
                    />
                    <DetailRow
                      label="Headline"
                      value={detail.completionProfessionalHeadline ?? '—'}
                    />
                    <DetailRow
                      label="Short bio"
                      value={detail.completionShortBio ?? '—'}
                    />
                    <DetailRow
                      label="Submitted at"
                      value={
                        detail.completionSubmittedAt
                          ? new Date(
                              detail.completionSubmittedAt,
                            ).toLocaleString('en-GB')
                          : '—'
                      }
                    />
                  </dl>
                </div>
              </>
            )}

            <Separator />

            <div className="flex flex-col gap-2">
              <h3 className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Internal notes
              </h3>
              <p className="rounded-md border border-border bg-muted/30 px-3 py-3 text-sm whitespace-pre-wrap text-foreground">
                {detail.internalNotes.length > 0
                  ? detail.internalNotes
                  : 'No notes yet.'}
              </p>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<FileTextIcon className="size-6" />}
            title="No application selected"
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
        {href ? (
          <a
            href={href}
            target={href.startsWith('mailto:') ? undefined : '_blank'}
            rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
            className="inline-flex items-center gap-1 break-all text-primary underline-offset-4 hover:underline"
          >
            {value}
            {!href.startsWith('mailto:') && (
              <ExternalLinkIcon className="size-3.5 shrink-0" />
            )}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
