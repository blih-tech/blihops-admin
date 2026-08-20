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
  getTalentProfile,
  type TalentProfileListItem,
} from '@/lib/api/talent/profiles';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: TalentProfileListItem | null;
};

export function TalentProfileDetailsDialog({
  open,
  onOpenChange,
  profile,
}: Props) {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ['talent-profiles', 'detail', profile?.id],
    queryFn: () => getTalentProfile(profile!.id),
    enabled: open && profile !== null,
  });

  const detail = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{profile?.fullName ?? 'Profile details'}</DialogTitle>
          <DialogDescription>
            {profile?.primaryRole ?? ''}{' '}
            {profile ? `· ${profile.seniority}` : ''}
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex flex-col gap-3 py-2">
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load profile"
            message={error.message}
            onRetry={() => void refetch()}
          />
        ) : detail ? (
          <div className="flex flex-col gap-6">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <DetailRow label="Full name" value={detail.fullName} />
              <DetailRow
                label="Email"
                value={detail.workEmail}
                href={`mailto:${detail.workEmail}`}
              />
              <DetailRow label="Phone" value={detail.phone} />
              <DetailRow
                label="Location"
                value={`${detail.city}, ${detail.country}`}
              />
              <DetailRow label="Role" value={detail.primaryRole} />
              <DetailRow label="Seniority" value={detail.seniority} />
              <DetailRow label="English" value={detail.englishLevel} />
              <DetailRow
                label="Experience"
                value={`${detail.yearsExperience} years`}
              />
              <DetailRow
                label="Rate EUR"
                value={`€${detail.clientMonthlyRateEur} / mo`}
                mono
              />
              <DetailRow label="Visibility" value={detail.visibility} mono />
              <DetailRow label="Account" value={detail.accountStatus} mono />
              <DetailRow
                label="Verified"
                value={detail.isVerified ? 'Yes' : 'No'}
              />
            </dl>

            <Separator />

            <div className="flex flex-col gap-2">
              <h3 className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Headline & bio
              </h3>
              <p className="text-sm font-medium text-foreground">
                {detail.professionalHeadline}
              </p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {detail.shortBio}
              </p>
              <DetailRow
                label="Photo key"
                value={detail.profilePhotoKey}
                mono
              />
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <h3 className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Skills
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
                  label="Resume key"
                  value={detail.resumeFileKey}
                  mono
                />
                <DetailRow
                  label="Application ID"
                  value={detail.applicationId}
                  mono
                />
              </dl>
            </div>

            <Separator />
            <div className="flex flex-col gap-2">
              <h3 className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Assessment & notes
              </h3>
              <p className="rounded-md border border-border bg-muted/30 px-3 py-3 text-sm whitespace-pre-wrap text-foreground">
                {detail.assessmentSummary}
              </p>
              <p className="rounded-md border border-border bg-muted/20 px-3 py-3 text-sm whitespace-pre-wrap text-muted-foreground">
                {detail.internalNotes}
              </p>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<FileTextIcon className="size-6" />}
            title="No profile selected"
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
            {value}{' '}
            {href.startsWith('mailto:') ? null : (
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
