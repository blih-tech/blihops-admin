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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dots } from '@/components/shared/Dots';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  talentApplicationNotesSchema,
  type TalentApplicationNotesValues,
} from '@/lib/validators/talent';
import {
  getTalentApplication,
  type TalentApplicationListItem,
} from '@/lib/api/talent/applications';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: TalentApplicationListItem | null;
  isSaving: boolean;
  onSave: (values: TalentApplicationNotesValues) => void;
};

export function EditNotesDialog({
  open,
  onOpenChange,
  application,
  isSaving,
  onSave,
}: Props) {
  const { data, isPending, error } = useQuery({
    queryKey: ['talent-applications', 'detail', application?.id],
    queryFn: () => getTalentApplication(application!.id),
    enabled: open && application !== null,
  });

  const detail = data?.data ?? null;

  const form = useForm<TalentApplicationNotesValues>({
    resolver: zodResolver(talentApplicationNotesSchema),
    defaultValues: { internalNotes: '' },
  });

  useEffect(() => {
    if (open && detail) {
      form.reset({ internalNotes: detail.internalNotes });
    }
  }, [open, detail, form]);

  function handleSubmit(values: TalentApplicationNotesValues) {
    onSave(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit internal notes</DialogTitle>
          <DialogDescription>
            {application
              ? `Notes for ${application.fullName} — visible only to admins.`
              : ' '}
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex flex-col gap-3 py-2">
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ) : error ? (
          <ErrorState title="Failed to load notes" message={error.message} />
        ) : (
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="internalNotes">Internal notes</Label>
              <Textarea
                id="internalNotes"
                placeholder="Add private assessment, flags, next steps..."
                rows={6}
                {...form.register('internalNotes')}
                aria-invalid={Boolean(form.formState.errors.internalNotes)}
              />
              {form.formState.errors.internalNotes && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.internalNotes.message}
                </p>
              )}
              <p className="font-mono text-[10px] text-muted-foreground">
                {form.watch('internalNotes')?.length ?? 0} / 5000
              </p>
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
                {isSaving ? <Dots dots={3} /> : 'Save notes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
