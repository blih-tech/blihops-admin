'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
import { Dots } from '@/components/shared/Dots';

const tagFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Tag name is required')
    .max(100, 'Keep the name under 100 characters'),
});

type TagFormValues = z.infer<typeof tagFormSchema>;

type TagFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  isSaving: boolean;
  onSave: (name: string) => void;
};

export function TagFormDialog({
  open,
  onOpenChange,
  initialName,
  isSaving,
  onSave,
}: TagFormDialogProps) {
  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: { name: initialName ?? '' },
  });

  const name = useWatch({ control: form.control, name: 'name' });
  const canSubmit = Boolean(name?.trim()) && !isSaving;

  function handleSubmit(values: TagFormValues) {
    onSave(values.name.trim());
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add tag</DialogTitle>
          <DialogDescription>
            Tags label case studies and insights. Names must be unique.
          </DialogDescription>
        </DialogHeader>
        <form
          key={open ? 'open' : 'closed'}
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="space-y-2">
            <Label htmlFor="tag-name">Tag name</Label>
            <Input
              id="tag-name"
              placeholder="e.g. AI Triage"
              maxLength={100}
              autoFocus
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
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
            <Button type="submit" disabled={!canSubmit}>
              {isSaving ? <Dots dots={3} /> : 'Add tag'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
