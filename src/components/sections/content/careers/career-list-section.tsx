'use client';

import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { PlusIcon, Trash2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CareerFormValues } from '@/lib/validators/career';

type CareerListSectionProps = {
  form: UseFormReturn<CareerFormValues>;
  name: 'overview' | 'responsibilities' | 'requirements';
  label: string;
  hint: string;
  placeholder: string;
};

export function CareerListSection({
  form,
  name,
  label,
  hint,
  placeholder,
}: CareerListSectionProps) {
  const { fields, append, remove } = useFieldArray<
    CareerFormValues,
    'overview' | 'responsibilities' | 'requirements'
  >({
    control: form.control,
    name,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => append({ value: '' })}
          aria-label={`Add ${label.toLowerCase()} entry`}
        >
          <PlusIcon />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>

      <div className="flex flex-col gap-3">
        {fields.map((field, index) => {
          return (
            <div key={field.id} className="relative">
              <Textarea
                {...form.register(`${name}.${index}.value`)}
                placeholder={placeholder}
                maxLength={500}
                rows={1}
                className="min-h-12 rounded-md bg-muted/40 py-2.5 pr-9 text-sm leading-relaxed field-sizing-content hover:bg-muted/60 focus-visible:bg-background"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-destructive"
                onClick={() => remove(index)}
                disabled={fields.length <= 1}
                title={
                  fields.length <= 1
                    ? 'At least one entry is required'
                    : undefined
                }
                aria-label={`Remove ${label.toLowerCase()} entry ${index + 1}`}
              >
                <Trash2Icon />
              </Button>
            </div>
          );
        })}
        {fields.length === 0 && (
          <p className="rounded-md border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
            No entries yet. Add the first one above.
          </p>
        )}
      </div>
    </div>
  );
}
