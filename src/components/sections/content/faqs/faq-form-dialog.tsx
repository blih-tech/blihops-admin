'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '@/lib/utils';
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
import { faqFormSchema, type FaqFormValues } from '@/lib/validators/faq';

const LOCALE_TABS = [
  { value: 'en', label: 'EN' },
  { value: 'de', label: 'DE' },
] as const;

type Locale = (typeof LOCALE_TABS)[number]['value'];

type FaqFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: FaqFormValues | null;
  nextDisplayOrder: number;
  isSaving: boolean;
  onSave: (values: FaqFormValues) => void;
};

export function FaqFormDialog({
  open,
  onOpenChange,
  initialValues,
  nextDisplayOrder,
  isSaving,
  onSave,
}: FaqFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-md sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add question</DialogTitle>
          <DialogDescription>
            Create a question for the Pilot page. English and German content are
            both required.
          </DialogDescription>
        </DialogHeader>

        <FaqFormContent
          initialValues={initialValues}
          nextDisplayOrder={nextDisplayOrder}
          isSaving={isSaving}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
}

function FaqFormContent({
  initialValues,
  nextDisplayOrder,
  isSaving,
  onOpenChange,
  onSave,
}: {
  initialValues?: FaqFormValues | null;
  nextDisplayOrder: number;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: FaqFormValues) => void;
}) {
  const [locale, setLocale] = useState<Locale>('en');

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    mode: 'onTouched',
    defaultValues: initialValues ?? {
      en: { question: '', answer: '' },
      de: { question: '', answer: '' },
      displayOrder: nextDisplayOrder,
    },
  });

  const enQuestion = useWatch({ control: form.control, name: 'en.question' });
  const enAnswer = useWatch({ control: form.control, name: 'en.answer' });
  const deQuestion = useWatch({ control: form.control, name: 'de.question' });
  const deAnswer = useWatch({ control: form.control, name: 'de.answer' });
  const displayOrder = useWatch({
    control: form.control,
    name: 'displayOrder',
  });

  const localeFieldsValid = faqFormSchema
    .pick({ en: true, de: true, displayOrder: true })
    .safeParse({
      en: { question: enQuestion, answer: enAnswer },
      de: { question: deQuestion, answer: deAnswer },
      displayOrder,
    }).success;

  const canSubmit = localeFieldsValid && !isSaving;

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="flex flex-col gap-5">
      <div className="rounded-md border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 pt-4 pb-4">
          <div className="flex items-center gap-1 rounded-md border border-border bg-muted/30 p-1">
            {LOCALE_TABS.map((tab) => {
              const isTabActive = locale === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={isTabActive}
                  onClick={() => setLocale(tab.value)}
                  className={cn(
                    'cursor-pointer rounded-sm px-4 py-1.5 font-mono text-xs font-semibold transition-colors',
                    isTabActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <p className="hidden text-xs text-muted-foreground sm:block">
            {locale === 'en' ? 'English content' : 'German content'}
          </p>
        </div>

        <div className="flex flex-col gap-5 p-5">
          <div className={cn('space-y-2', locale !== 'en' && 'hidden')}>
            <Label htmlFor="faq-en-question">Question</Label>
            <Input
              id="faq-en-question"
              placeholder="e.g. How long does a pilot engagement last?"
              maxLength={500}
              autoFocus
              {...form.register('en.question')}
            />
            {form.formState.errors.en?.question && (
              <p className="text-xs text-destructive">
                {form.formState.errors.en.question.message}
              </p>
            )}
          </div>
          <div className={cn('space-y-2', locale !== 'en' && 'hidden')}>
            <Label htmlFor="faq-en-answer">Answer</Label>
            <Textarea
              id="faq-en-answer"
              placeholder="The public answer shown on the Pilot page."
              maxLength={4000}
              rows={5}
              {...form.register('en.answer')}
            />
            {form.formState.errors.en?.answer && (
              <p className="text-xs text-destructive">
                {form.formState.errors.en.answer.message}
              </p>
            )}
          </div>

          <div className={cn('space-y-2', locale !== 'de' && 'hidden')}>
            <Label htmlFor="faq-de-question">Frage</Label>
            <Input
              id="faq-de-question"
              placeholder="z. B. Wie lange dauert ein Pilotprojekt?"
              maxLength={500}
              {...form.register('de.question')}
            />
            {form.formState.errors.de?.question && (
              <p className="text-xs text-destructive">
                {form.formState.errors.de.question.message}
              </p>
            )}
          </div>
          <div className={cn('space-y-2', locale !== 'de' && 'hidden')}>
            <Label htmlFor="faq-de-answer">Antwort</Label>
            <Textarea
              id="faq-de-answer"
              placeholder="Die öffentliche Antwort auf der Pilot-Seite."
              maxLength={4000}
              rows={5}
              {...form.register('de.answer')}
            />
            {form.formState.errors.de?.answer && (
              <p className="text-xs text-destructive">
                {form.formState.errors.de.answer.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="faq-display-order">Display order</Label>
        <Input
          id="faq-display-order"
          type="number"
          min={0}
          step={1}
          className="w-32"
          {...form.register('displayOrder', { valueAsNumber: true })}
        />
        <p className="text-xs text-muted-foreground">
          Lower numbers appear first on the Pilot page.
        </p>
        {form.formState.errors.displayOrder && (
          <p className="text-xs text-destructive">
            {form.formState.errors.displayOrder.message}
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
          {isSaving ? <Dots dots={3} /> : 'Create question'}
        </Button>
      </DialogFooter>
    </form>
  );
}
