'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { AvatarUpload } from '@/components/sections/content/testimonials/avatar-upload';
import {
  testimonialFormSchema,
  type TestimonialFormValues,
} from '@/lib/validators/testimonial';
import type { Testimonial } from '@/lib/api/content/testimonials';

type TestimonialFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: Testimonial | null;
  initialValues?: TestimonialFormValues | null;
  isSaving: boolean;
  onSave: (values: TestimonialFormValues) => void;
};

export function TestimonialFormDialog({
  open,
  onOpenChange,
  testimonial,
  initialValues,
  isSaving,
  onSave,
}: TestimonialFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {testimonial ? 'Edit testimonial' : 'Add testimonial'}
          </DialogTitle>
          <DialogDescription>
            {testimonial
              ? 'Update the avatar or details of this testimonial.'
              : 'Share a client quote. All testimonials are public on the home page.'}
          </DialogDescription>
        </DialogHeader>
        <TestimonialFormContent
          key={testimonial?.id ?? 'new'}
          testimonial={testimonial}
          initialValues={initialValues}
          isSaving={isSaving}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
}

function TestimonialFormContent({
  testimonial,
  initialValues,
  isSaving,
  onOpenChange,
  onSave,
}: {
  testimonial?: Testimonial | null;
  initialValues?: TestimonialFormValues | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: TestimonialFormValues) => void;
}) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: {
      avatarUrl: initialValues?.avatarUrl ?? testimonial?.avatarUrl ?? '',
      name: initialValues?.name ?? testimonial?.name ?? '',
      role: initialValues?.role ?? testimonial?.role ?? '',
      company: initialValues?.company ?? testimonial?.company ?? '',
      quote: initialValues?.quote ?? testimonial?.quote ?? '',
    },
  });

  const avatarUrl = useWatch({ control: form.control, name: 'avatarUrl' });
  const name = useWatch({ control: form.control, name: 'name' });
  const role = useWatch({ control: form.control, name: 'role' });
  const company = useWatch({ control: form.control, name: 'company' });
  const quote = useWatch({ control: form.control, name: 'quote' });
  const avatarError = uploadError ?? form.formState.errors.avatarUrl?.message;
  const isReady = testimonialFormSchema.safeParse({
    avatarUrl,
    name,
    role,
    company,
    quote,
  }).success;
  const canSubmit = isReady && !isUploading && !isSaving;

  function handleSubmit(values: TestimonialFormValues) {
    if (!values.avatarUrl) {
      setUploadError('Avatar image is required');
      return;
    }
    setUploadError(null);
    onSave(values);
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-col gap-5"
    >
      <div className="space-y-2">
        <Label htmlFor="avatar">Avatar</Label>
        <AvatarUpload
          value={avatarUrl}
          onChange={(url) => {
            setUploadError(null);
            form.setValue('avatarUrl', url ?? '', { shouldValidate: true });
          }}
          onUploadingChange={setIsUploading}
          error={avatarError}
          disabled={isSaving}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="e.g. Sarah Chen"
            maxLength={100}
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register('name')}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            placeholder="e.g. Northline SaaS"
            maxLength={100}
            aria-invalid={Boolean(form.formState.errors.company)}
            {...form.register('company')}
          />
          {form.formState.errors.company && (
            <p className="text-xs text-destructive">
              {form.formState.errors.company.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          placeholder="e.g. Head of Operations"
          maxLength={100}
          aria-invalid={Boolean(form.formState.errors.role)}
          {...form.register('role')}
        />
        {form.formState.errors.role && (
          <p className="text-xs text-destructive">
            {form.formState.errors.role.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="quote">Quote</Label>
        <Textarea
          id="quote"
          placeholder="What did this client say about working with BlihOps?"
          maxLength={2000}
          rows={5}
          aria-invalid={Boolean(form.formState.errors.quote)}
          {...form.register('quote')}
        />
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Shown on the home page. The primary quote is featured on the
            managed-outsourcing section.
          </p>
          <p className="text-xs tabular-nums text-muted-foreground">
            {quote?.length ?? 0}/2000
          </p>
        </div>
        {form.formState.errors.quote && (
          <p className="text-xs text-destructive">
            {form.formState.errors.quote.message}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSaving || isUploading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isSaving ? (
            <Dots dots={3} />
          ) : testimonial ? (
            'Save changes'
          ) : (
            'Add testimonial'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
