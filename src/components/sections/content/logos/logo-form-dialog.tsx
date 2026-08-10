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
import { Dots } from '@/components/shared/Dots';
import { LogoUpload } from '@/components/sections/content/logos/logo-upload';
import { logoFormSchema, type LogoFormValues } from '@/lib/validators/logo';
import type { Logo } from '@/lib/api/content/logos';

type LogoFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logo?: Logo | null;
  initialValues?: LogoFormValues | null;
  isSaving: boolean;
  onSave: (values: LogoFormValues) => void;
};

export function LogoFormDialog({
  open,
  onOpenChange,
  logo,
  initialValues,
  isSaving,
  onSave,
}: LogoFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{logo ? 'Edit logo' : 'Add logo'}</DialogTitle>
          <DialogDescription>
            {logo
              ? 'Update the image or alt text for this trusted logo.'
              : 'Upload a client logo and describe it. All logos are public on the home page.'}
          </DialogDescription>
        </DialogHeader>
        <LogoFormContent
          key={logo?.id ?? 'new'}
          logo={logo}
          initialValues={initialValues}
          isSaving={isSaving}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
}

function LogoFormContent({
  logo,
  initialValues,
  isSaving,
  onOpenChange,
  onSave,
}: {
  logo?: Logo | null;
  initialValues?: LogoFormValues | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: LogoFormValues) => void;
}) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<LogoFormValues>({
    resolver: zodResolver(logoFormSchema),
    defaultValues: {
      imageUrl: initialValues?.imageUrl ?? logo?.imageUrl ?? '',
      alt: initialValues?.alt ?? logo?.alt ?? '',
    },
  });

  const imageUrl = useWatch({ control: form.control, name: 'imageUrl' });
  const alt = useWatch({ control: form.control, name: 'alt' });
  const imageError = uploadError ?? form.formState.errors.imageUrl?.message;
  const isReady = logoFormSchema.safeParse({ imageUrl, alt }).success;
  const canSubmit = isReady && !isUploading && !isSaving;

  function handleSubmit(values: LogoFormValues) {
    if (!values.imageUrl) {
      setUploadError('Logo image is required');
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
        <Label htmlFor="logo-image">Logo image</Label>
        <LogoUpload
          value={imageUrl}
          onChange={(url) => {
            setUploadError(null);
            form.setValue('imageUrl', url ?? '', { shouldValidate: true });
          }}
          onUploadingChange={setIsUploading}
          error={imageError}
          disabled={isSaving}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="logo-alt">Alt text</Label>
        <Input
          id="logo-alt"
          placeholder="e.g. Acme Corporation"
          maxLength={160}
          aria-invalid={Boolean(form.formState.errors.alt)}
          {...form.register('alt')}
        />
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Accessibility text shown in place of the image.
          </p>
          <p className="text-xs tabular-nums text-muted-foreground">
            {alt?.length ?? 0}/160
          </p>
        </div>
        {form.formState.errors.alt && (
          <p className="text-xs text-destructive">
            {form.formState.errors.alt.message}
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
          {isSaving ? <Dots dots={3} /> : logo ? 'Save changes' : 'Add logo'}
        </Button>
      </DialogFooter>
    </form>
  );
}
