'use client';

import { useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, XIcon } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dots } from '@/components/shared/Dots';
import { serviceIcons, type ServiceIconKey } from '@/lib/api/content/services';
import {
  serviceFormSchema,
  type ServiceFormValues,
} from '@/lib/validators/services';

import { CoverUpload } from './cover-upload';
import { serviceIconRegistry } from './service-icons';

const LOCALE_TABS = [
  { value: 'en', label: 'EN' },
  { value: 'de', label: 'DE' },
] as const;

type Locale = (typeof LOCALE_TABS)[number]['value'];

const MAX_FEATURES = 6;

type ServiceFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextDisplayOrder: number;
  isSaving: boolean;
  onSave: (values: ServiceFormValues) => void;
};

export function ServiceFormDialog({
  open,
  onOpenChange,
  nextDisplayOrder,
  isSaving,
  onSave,
}: ServiceFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-md sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add service</DialogTitle>
          <DialogDescription>
            Create a service for the website. English and German content are
            both required — services go live as soon as they are saved.
          </DialogDescription>
        </DialogHeader>

        <ServiceFormContent
          key="new"
          nextDisplayOrder={nextDisplayOrder}
          isSaving={isSaving}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
}

function emptyValues(displayOrder: number): ServiceFormValues {
  return {
    icon: 'headset',
    imageUrl: '',
    alt: '',
    displayOrder,
    en: emptyLocaleValues(),
    de: emptyLocaleValues(),
  };
}

function emptyLocaleValues(): ServiceFormValues['en'] {
  return {
    slug: '',
    title: '',
    subtitle: '',
    shortDescription: '',
    details: '',
    tag: '',
    body: '',
    features: [{ value: '' }],
    whoThisIsFor: '',
  };
}

function ServiceFormContent({
  nextDisplayOrder,
  isSaving,
  onOpenChange,
  onSave,
}: {
  nextDisplayOrder: number;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: ServiceFormValues) => void;
}) {
  const [locale, setLocale] = useState<Locale>('en');
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    mode: 'onTouched',
    defaultValues: emptyValues(nextDisplayOrder),
  });

  const values = useWatch({ control: form.control });
  const icon = useWatch({ control: form.control, name: 'icon' });
  const imageUrl = useWatch({ control: form.control, name: 'imageUrl' });

  const enFeatures = useFieldArray<
    ServiceFormValues,
    'en.features' | 'de.features'
  >({
    control: form.control,
    name: 'en.features',
  });
  const deFeatures = useFieldArray<
    ServiceFormValues,
    'en.features' | 'de.features'
  >({
    control: form.control,
    name: 'de.features',
  });

  const canSubmit =
    serviceFormSchema.safeParse(values).success && !isSaving && !isUploading;

  const localeError = (locale: Locale, field: keyof ServiceFormValues['en']) =>
    form.formState.errors[locale]?.[field]?.message;

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 rounded-md border border-border bg-card p-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="service-icon">Icon</Label>
            <Select
              value={icon}
              onValueChange={(value) =>
                form.setValue('icon', value as ServiceIconKey, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="service-icon" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {serviceIcons.map((key) => {
                  const Icon = serviceIconRegistry[key];
                  return (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <Icon className="size-4" strokeWidth={1.75} />
                        {key}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-display-order">Display order</Label>
            <Input
              id="service-display-order"
              type="number"
              min={0}
              step={1}
              className="w-32"
              {...form.register('displayOrder', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first. Leave as-is to append to the end.
            </p>
            {form.formState.errors.displayOrder && (
              <p className="text-xs text-destructive">
                {form.formState.errors.displayOrder.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-image">Cover image</Label>
          <CoverUpload
            value={imageUrl}
            onChange={(url) =>
              form.setValue('imageUrl', url ?? '', { shouldValidate: true })
            }
            onUploadingChange={setIsUploading}
            error={form.formState.errors.imageUrl?.message ?? undefined}
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-alt">Alt text</Label>
          <Input
            id="service-alt"
            placeholder="e.g. Customer support team at work"
            maxLength={160}
            aria-invalid={Boolean(form.formState.errors.alt)}
            {...form.register('alt')}
          />
          <p className="text-xs text-muted-foreground">
            Accessible label describing the cover image.
          </p>
          {form.formState.errors.alt && (
            <p className="text-xs text-destructive">
              {form.formState.errors.alt.message}
            </p>
          )}
        </div>
      </div>

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
          <LocaleField
            label="Slug"
            inputId="service-en-slug"
            hidden={locale !== 'en'}
            error={localeError('en', 'slug')}
          >
            <Input
              id="service-en-slug"
              placeholder="e.g. customer-support"
              maxLength={100}
              className="font-mono"
              autoFocus
              {...form.register('en.slug')}
            />
            <p className="text-xs text-muted-foreground">
              Used for the in-page anchor on the website (
              /what-we-offer#&lt;slug&gt;).
            </p>
          </LocaleField>
          <LocaleField
            label="Slug"
            inputId="service-de-slug"
            hidden={locale !== 'de'}
            error={localeError('de', 'slug')}
          >
            <Input
              id="service-de-slug"
              placeholder="z. B. kundenservice"
              maxLength={100}
              className="font-mono"
              {...form.register('de.slug')}
            />
            <p className="text-xs text-muted-foreground">
              Wird für den In-Page-Anker auf der Website verwendet (
              /what-we-offer#&lt;slug&gt;).
            </p>
          </LocaleField>

          <LocaleField
            label="Title"
            inputId="service-en-title"
            hidden={locale !== 'en'}
            error={localeError('en', 'title')}
          >
            <Input
              id="service-en-title"
              placeholder="e.g. Customer Support"
              maxLength={150}
              {...form.register('en.title')}
            />
          </LocaleField>
          <LocaleField
            label="Title"
            inputId="service-de-title"
            hidden={locale !== 'de'}
            error={localeError('de', 'title')}
          >
            <Input
              id="service-de-title"
              placeholder="z. B. Kundenservice"
              maxLength={150}
              {...form.register('de.title')}
            />
          </LocaleField>

          <LocaleField
            label="Subtitle"
            inputId="service-en-subtitle"
            hidden={locale !== 'en'}
            error={localeError('en', 'subtitle')}
          >
            <Input
              id="service-en-subtitle"
              placeholder="e.g. Support that scales without the chaos"
              maxLength={300}
              {...form.register('en.subtitle')}
            />
          </LocaleField>
          <LocaleField
            label="Subtitle"
            inputId="service-de-subtitle"
            hidden={locale !== 'de'}
            error={localeError('de', 'subtitle')}
          >
            <Input
              id="service-de-subtitle"
              placeholder="z. B. Support, der skaliert ohne Chaos"
              maxLength={300}
              {...form.register('de.subtitle')}
            />
          </LocaleField>

          <LocaleField
            label="Short description"
            inputId="service-en-short-description"
            hidden={locale !== 'en'}
            error={localeError('en', 'shortDescription')}
          >
            <Textarea
              id="service-en-short-description"
              placeholder="Landing page card copy."
              maxLength={300}
              rows={2}
              {...form.register('en.shortDescription')}
            />
          </LocaleField>
          <LocaleField
            label="Short description"
            inputId="service-de-short-description"
            hidden={locale !== 'de'}
            error={localeError('de', 'shortDescription')}
          >
            <Textarea
              id="service-de-short-description"
              placeholder="Text für die Landing-Page-Karte."
              maxLength={300}
              rows={2}
              {...form.register('de.shortDescription')}
            />
          </LocaleField>

          <LocaleField
            label="Details"
            inputId="service-en-details"
            hidden={locale !== 'en'}
            error={localeError('en', 'details')}
          >
            <Textarea
              id="service-en-details"
              placeholder="Landing page panel copy."
              maxLength={500}
              rows={3}
              {...form.register('en.details')}
            />
          </LocaleField>
          <LocaleField
            label="Details"
            inputId="service-de-details"
            hidden={locale !== 'de'}
            error={localeError('de', 'details')}
          >
            <Textarea
              id="service-de-details"
              placeholder="Text für das Landing-Page-Panel."
              maxLength={500}
              rows={3}
              {...form.register('de.details')}
            />
          </LocaleField>

          <LocaleField
            label="Tag"
            inputId="service-en-tag"
            hidden={locale !== 'en'}
            error={localeError('en', 'tag')}
          >
            <Input
              id="service-en-tag"
              placeholder="e.g. SUPPORT THAT SCALES"
              maxLength={80}
              className="uppercase"
              {...form.register('en.tag')}
            />
          </LocaleField>
          <LocaleField
            label="Tag"
            inputId="service-de-tag"
            hidden={locale !== 'de'}
            error={localeError('de', 'tag')}
          >
            <Input
              id="service-de-tag"
              placeholder="z. B. SUPPORT, DER SKALIERT"
              maxLength={80}
              className="uppercase"
              {...form.register('de.tag')}
            />
          </LocaleField>

          <LocaleField
            label="Body"
            inputId="service-en-body"
            hidden={locale !== 'en'}
            error={localeError('en', 'body')}
          >
            <Textarea
              id="service-en-body"
              placeholder="Main paragraph shown on the What We Offer page."
              maxLength={5000}
              rows={5}
              {...form.register('en.body')}
            />
          </LocaleField>
          <LocaleField
            label="Body"
            inputId="service-de-body"
            hidden={locale !== 'de'}
            error={localeError('de', 'body')}
          >
            <Textarea
              id="service-de-body"
              placeholder="Hauptabsatz auf der What-We-Offer-Seite."
              maxLength={5000}
              rows={5}
              {...form.register('de.body')}
            />
          </LocaleField>

          <FeaturesField
            label="Features"
            hidden={locale !== 'en'}
            error={localeError('en', 'features')}
            fields={enFeatures.fields}
            registerPath="en.features"
            onRemove={(index) => enFeatures.remove(index)}
            onAdd={() => enFeatures.append({ value: '' })}
            canAdd={enFeatures.fields.length < MAX_FEATURES}
            disabled={isSaving}
            form={form}
          />
          <FeaturesField
            label="Features"
            hidden={locale !== 'de'}
            error={localeError('de', 'features')}
            fields={deFeatures.fields}
            registerPath="de.features"
            onRemove={(index) => deFeatures.remove(index)}
            onAdd={() => deFeatures.append({ value: '' })}
            canAdd={deFeatures.fields.length < MAX_FEATURES}
            disabled={isSaving}
            form={form}
          />

          <LocaleField
            label="Who this is for"
            inputId="service-en-who-this-is-for"
            hidden={locale !== 'en'}
            error={localeError('en', 'whoThisIsFor')}
          >
            <Textarea
              id="service-en-who-this-is-for"
              placeholder="The audience this service targets."
              maxLength={500}
              rows={3}
              {...form.register('en.whoThisIsFor')}
            />
          </LocaleField>
          <LocaleField
            label="Who this is for"
            inputId="service-de-who-this-is-for"
            hidden={locale !== 'de'}
            error={localeError('de', 'whoThisIsFor')}
          >
            <Textarea
              id="service-de-who-this-is-for"
              placeholder="Die Zielgruppe dieses Services."
              maxLength={500}
              rows={3}
              {...form.register('de.whoThisIsFor')}
            />
          </LocaleField>
        </div>
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
          {isSaving ? <Dots dots={3} /> : 'Create service'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function LocaleField({
  label,
  inputId,
  hidden,
  error,
  children,
}: {
  label: string;
  inputId: string;
  hidden: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('space-y-2', hidden && 'hidden')}>
      <Label htmlFor={inputId}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function FeaturesField({
  label,
  hidden,
  error,
  fields,
  registerPath,
  onRemove,
  onAdd,
  canAdd,
  disabled,
  form,
}: {
  label: string;
  hidden: boolean;
  error?: string;
  fields: { id: string }[];
  registerPath: 'en.features' | 'de.features';
  onRemove: (index: number) => void;
  onAdd: () => void;
  canAdd: boolean;
  disabled: boolean;
  form: ReturnType<typeof useForm<ServiceFormValues>>;
}) {
  const locale = registerPath.startsWith('en.') ? 'en' : 'de';
  const featureErrors = form.formState.errors[locale]?.features;

  return (
    <div className={cn('space-y-2', hidden && 'hidden')}>
      <Label>{label}</Label>
      <div className="flex flex-col gap-2">
        {fields.map((field, index) => {
          const itemError = featureErrors?.[index]?.value?.message;
          return (
            <div key={field.id} className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <Input
                  placeholder={`Feature ${index + 1}`}
                  maxLength={200}
                  aria-invalid={Boolean(itemError)}
                  {...form.register(`${registerPath}.${index}.value`)}
                />
                {itemError && (
                  <p className="text-xs text-destructive">{itemError}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onRemove(index)}
                aria-label="Remove feature"
                disabled={disabled}
              >
                <XIcon />
              </Button>
            </div>
          );
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAdd}
        disabled={!canAdd || disabled}
      >
        <PlusIcon data-icon="inline-start" />
        Add feature
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
