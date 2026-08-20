'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dots } from '@/components/shared/Dots';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  updateTalentProfileSchema,
  type UpdateTalentProfileValues,
} from '@/lib/validators/talent';
import {
  getTalentProfile,
  type TalentProfileListItem,
} from '@/lib/api/talent/profiles';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: TalentProfileListItem | null;
  isSaving: boolean;
  onSave: (values: UpdateTalentProfileValues) => void;
};

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  isSaving,
  onSave,
}: Props) {
  const { data, isPending, error } = useQuery({
    queryKey: ['talent-profiles', 'detail', profile?.id],
    queryFn: () => getTalentProfile(profile!.id),
    enabled: open && profile !== null,
  });

  const detail = data?.data ?? null;

  const form = useForm<UpdateTalentProfileValues>({
    resolver: zodResolver(updateTalentProfileSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (open && detail) {
      form.reset({
        seniority: detail.seniority,
        englishLevel: detail.englishLevel,
        clientMonthlyRateEur: detail.clientMonthlyRateEur,
        assessmentSummary: detail.assessmentSummary,
        internalNotes: detail.internalNotes,
      });
    }
    if (!open) form.reset({});
  }, [open, detail, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit talent profile</DialogTitle>
          <DialogDescription>
            {profile
              ? `Update ${profile.fullName}. Visible profiles must be hidden before editing.`
              : ' '}
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex flex-col gap-3 py-2">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        ) : error ? (
          <ErrorState title="Failed to load profile" message={error.message} />
        ) : (
          <form
            onSubmit={form.handleSubmit((values) => {
              // only send dirty fields
              const changed: Record<string, unknown> = {};
              for (const k of Object.keys(values) as (keyof typeof values)[]) {
                if (form.formState.dirtyFields[k]) changed[k] = values[k];
              }
              if (Object.keys(changed).length === 0) return;
              onSave(changed as UpdateTalentProfileValues);
            })}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="edit-seniority">Seniority</Label>
              <Input
                id="edit-seniority"
                placeholder="Senior, Mid..."
                {...form.register('seniority')}
              />
              {form.formState.errors.seniority && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.seniority.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-english">English level</Label>
              <Input
                id="edit-english"
                placeholder="C1, B2..."
                {...form.register('englishLevel')}
              />
              {form.formState.errors.englishLevel && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.englishLevel.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-rate">Client monthly rate EUR</Label>
              <Input
                id="edit-rate"
                placeholder="2500.00"
                inputMode="decimal"
                {...form.register('clientMonthlyRateEur')}
              />
              {form.formState.errors.clientMonthlyRateEur && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.clientMonthlyRateEur.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-assessment">Assessment summary</Label>
              <Textarea
                id="edit-assessment"
                rows={4}
                {...form.register('assessmentSummary')}
              />
              {form.formState.errors.assessmentSummary && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.assessmentSummary.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Internal notes</Label>
              <Textarea
                id="edit-notes"
                rows={3}
                {...form.register('internalNotes')}
              />
              {form.formState.errors.internalNotes && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.internalNotes.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !form.formState.isDirty}
              >
                {isSaving ? <Dots dots={3} /> : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
