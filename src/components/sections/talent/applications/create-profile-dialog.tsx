'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { Dots } from '@/components/shared/Dots';
import {
  createTalentProfileSchema,
  type CreateTalentProfileValues,
} from '@/lib/validators/talent';
import type { TalentApplicationListItem } from '@/lib/api/talent/applications';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: TalentApplicationListItem | null;
  isSaving: boolean;
  onSave: (values: CreateTalentProfileValues) => void;
};

export function CreateProfileDialog({
  open,
  onOpenChange,
  application,
  isSaving,
  onSave,
}: Props) {
  const form = useForm<CreateTalentProfileValues>({
    resolver: zodResolver(createTalentProfileSchema),
    defaultValues: {
      seniority: '',
      englishLevel: '',
      clientMonthlyRateEur: '',
      assessmentSummary: '',
      internalNotes: '',
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  function handleSubmit(values: CreateTalentProfileValues) {
    onSave(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create talent profile</DialogTitle>
          <DialogDescription>
            {application
              ? `Create a verified profile for ${application.fullName}. This will set the application to PROFILE_CREATED and create a TalentAccount invitation.`
              : ' '}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="seniority">Seniority</Label>
            <Input
              id="seniority"
              placeholder="e.g. Senior, Mid, Junior"
              {...form.register('seniority')}
            />
            {form.formState.errors.seniority && (
              <p className="text-xs text-destructive">
                {form.formState.errors.seniority.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="englishLevel">English level</Label>
            <Input
              id="englishLevel"
              placeholder="e.g. C1, B2, Native"
              {...form.register('englishLevel')}
            />
            {form.formState.errors.englishLevel && (
              <p className="text-xs text-destructive">
                {form.formState.errors.englishLevel.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="clientMonthlyRateEur">
              Client monthly rate (EUR)
            </Label>
            <Input
              id="clientMonthlyRateEur"
              placeholder="e.g. 2500 or 2500.00"
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
            <Label htmlFor="assessmentSummary">Assessment summary</Label>
            <Textarea
              id="assessmentSummary"
              placeholder="Summarize technical / English / remote readiness assessment..."
              rows={4}
              {...form.register('assessmentSummary')}
            />
            {form.formState.errors.assessmentSummary && (
              <p className="text-xs text-destructive">
                {form.formState.errors.assessmentSummary.message}
              </p>
            )}
            <p className="font-mono text-[10px] text-muted-foreground">
              {form.watch('assessmentSummary')?.length ?? 0} / 2000
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="internalNotes">Internal notes</Label>
            <Textarea
              id="internalNotes"
              placeholder="Private notes for this profile..."
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
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Dots dots={3} /> : 'Create profile'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
