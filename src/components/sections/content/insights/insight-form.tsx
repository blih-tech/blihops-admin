'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useFieldArray,
  useForm,
  useWatch,
  type UseFormReturn,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, PlusIcon, Trash2Icon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dots } from '@/components/shared/Dots';
import { ErrorState } from '@/components/shared/ErrorState';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { MediaField } from '@/components/sections/content/case-studies/media-field';
import { TagInput } from '@/components/sections/content/case-studies/tag-input';
import {
  createInsight,
  getInsight,
  updateInsight,
  type CreateInsightPayload,
  type Insight,
  type InsightLocaleContent,
  type UpdateInsightPayload,
} from '@/lib/api/content/insights';
import { listCategories } from '@/lib/api/content/categories';
import { listTags } from '@/lib/api/content/tags';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  insightFormSchema,
  type InsightFormValues,
} from '@/lib/validators/insight';

type Locale = 'en' | 'de';

const LOCALE_TABS: { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'de', label: 'DE' },
];

const LIST_KEY = ['content', 'insights'] as const;

function buildPayload(values: InsightFormValues): CreateInsightPayload {
  const content: CreateInsightPayload['content'] = {};

  for (const locale of ['en', 'de'] as const) {
    const localeContent = values.content[locale];
    if (!localeContent) continue;
    const body = buildBody(localeContent.body);
    const hasAny = Boolean(
      localeContent.title ||
      localeContent.slug ||
      localeContent.excerpt ||
      body.length > 0,
    );
    if (hasAny) {
      content[locale] = {
        ...(localeContent.title ? { title: localeContent.title } : {}),
        ...(localeContent.slug ? { slug: localeContent.slug } : {}),
        ...(localeContent.excerpt ? { excerpt: localeContent.excerpt } : {}),
        ...(body.length > 0 ? { body } : {}),
      };
    }
  }

  return {
    author: values.author,
    ...(values.readTimeMinutes !== undefined &&
    values.readTimeMinutes !== null &&
    !Number.isNaN(values.readTimeMinutes)
      ? { readTimeMinutes: values.readTimeMinutes }
      : {}),
    ...(values.categoryId ? { categoryId: values.categoryId } : {}),
    ...(values.media ? { media: values.media } : {}),
    ...(values.tags && values.tags.length > 0 ? { tags: values.tags } : {}),
    ...(Object.keys(content).length > 0 ? { content } : {}),
  };
}

type InsightSection = { section: string; content: string };

function buildBody(body: InsightSection[] | undefined): InsightSection[] {
  return (body ?? [])
    .filter((section) => section.section.trim().length > 0)
    .map((section) => ({
      section: section.section.trim(),
      content: section.content ?? '',
    }));
}

function buildEditPatches(values: InsightFormValues): UpdateInsightPayload[] {
  const patches: UpdateInsightPayload[] = [
    {
      author: values.author,
      ...(values.readTimeMinutes !== undefined &&
      values.readTimeMinutes !== null &&
      !Number.isNaN(values.readTimeMinutes)
        ? { readTimeMinutes: values.readTimeMinutes }
        : {}),
      ...(values.categoryId !== undefined
        ? { categoryId: values.categoryId ?? null }
        : {}),
      ...(values.media ? { media: values.media } : {}),
      ...(values.tags && values.tags.length > 0 ? { tags: values.tags } : {}),
    },
  ];

  for (const locale of ['en', 'de'] as const) {
    const localeContent = values.content[locale];
    if (!localeContent) continue;
    const body = buildBody(localeContent.body);
    const content: Partial<InsightLocaleContent> = {};
    if (localeContent.title) content.title = localeContent.title;
    if (localeContent.slug) content.slug = localeContent.slug;
    if (localeContent.excerpt) content.excerpt = localeContent.excerpt;
    if (body.length > 0) content.body = body;
    if (Object.keys(content).length > 0) {
      patches.push({ locale, content });
    }
  }

  return patches;
}

function localeDefaults(locale?: Partial<InsightLocaleContent>): {
  title: string;
  slug: string;
  excerpt: string;
  body: InsightSection[];
} {
  return {
    title: locale?.title ?? '',
    slug: locale?.slug ?? '',
    excerpt: locale?.excerpt ?? '',
    body: locale?.body ?? [],
  };
}

export function InsightForm({ insightId }: { insightId?: string }) {
  const isEdit = Boolean(insightId);
  const detailQuery = useQuery({
    queryKey: ['content', 'insights', 'detail', insightId],
    queryFn: () => getInsight(insightId as string),
    enabled: isEdit,
  });

  if (isEdit && detailQuery.isPending) {
    return <EditSkeleton />;
  }

  if (isEdit && detailQuery.isError) {
    return (
      <ErrorState
        title="Failed to load insight"
        message={detailQuery.error.message}
        onRetry={() => {
          void detailQuery.refetch();
        }}
      />
    );
  }

  return (
    <InsightFormFields
      key={insightId ?? 'new'}
      initialData={detailQuery.data?.data ?? null}
    />
  );
}

function InsightFormFields({ initialData }: { initialData: Insight | null }) {
  const isEdit = initialData !== null;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [locale, setLocale] = useState<Locale>('en');
  const [isUploading, setIsUploading] = useState(false);
  const editId = initialData?.id ?? null;

  const categoriesQuery = useQuery({
    queryKey: ['content', 'categories'],
    queryFn: listCategories,
  });
  const tagsQuery = useQuery({
    queryKey: ['content', 'tags'],
    queryFn: listTags,
  });

  const form = useForm<InsightFormValues>({
    resolver: zodResolver(insightFormSchema),
    defaultValues: {
      author: initialData?.author ?? '',
      readTimeMinutes:
        initialData && initialData.readTimeMinutes > 0
          ? initialData.readTimeMinutes
          : undefined,
      categoryId: initialData?.category?.id ?? null,
      tags: initialData?.tags.map((tag) => tag.id) ?? [],
      media:
        initialData?.media && initialData.media.url
          ? initialData.media
          : undefined,
      content: {
        en: localeDefaults(initialData?.content?.en),
        de: localeDefaults(initialData?.content?.de),
      },
    },
  });

  const author = useWatch({ control: form.control, name: 'author' });
  const categoryId = useWatch({ control: form.control, name: 'categoryId' });
  const tags = useWatch({ control: form.control, name: 'tags' });
  const media = useWatch({ control: form.control, name: 'media' });

  const createMutation = useMutation({
    mutationFn: (values: InsightFormValues) =>
      createInsight(buildPayload(values)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
      toastSuccess('Draft created');
      router.push('/content/insights');
    },
    onError: (err) => {
      toastError('Failed to create insight', err.message);
    },
  });

  const editMutation = useMutation({
    mutationFn: async (values: InsightFormValues) => {
      if (editId === null) {
        throw new Error('Insight not found');
      }
      const patches = buildEditPatches(values);
      for (const patch of patches) {
        await updateInsight(editId, patch);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
      toastSuccess('Insight updated');
      router.push('/content/insights');
    },
    onError: (err) => {
      toastError('Failed to update insight', err.message);
    },
  });

  const isSaving = createMutation.isPending || editMutation.isPending;
  const canSubmit = Boolean(author.trim()) && !isUploading && !isSaving;

  function handleSubmit(values: InsightFormValues) {
    if (isEdit) {
      editMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  if (categoriesQuery.isError || tagsQuery.isError) {
    return (
      <ErrorState
        title="Failed to load categories or tags"
        message={
          categoriesQuery.error?.message ?? tagsQuery.error?.message ?? ''
        }
        onRetry={() => {
          void categoriesQuery.refetch();
          void tagsQuery.refetch();
        }}
      />
    );
  }

  const isBusy = isSaving || isUploading;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/content/insights"
            className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to insights
          </Link>
          <h1 className="mt-2 font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {isEdit ? 'Edit Insight' : 'Add Insight'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Both English and German are required before publishing.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/content/insights')}
          disabled={isBusy}
        >
          Cancel
        </Button>
      </div>

      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-5 rounded-md border border-border bg-card p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="e.g. BlihOps Team"
                maxLength={100}
                aria-invalid={Boolean(form.formState.errors.author)}
                {...form.register('author')}
              />
              {form.formState.errors.author && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.author.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="read-time">Read time (minutes)</Label>
              <Input
                id="read-time"
                type="number"
                min={1}
                placeholder="e.g. 6"
                aria-invalid={Boolean(form.formState.errors.readTimeMinutes)}
                {...form.register('readTimeMinutes', { valueAsNumber: true })}
              />
              {form.formState.errors.readTimeMinutes && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.readTimeMinutes.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categoryId ?? undefined}
                onValueChange={(value) =>
                  form.setValue('categoryId', value, { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full rounded-md">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="rounded-md">
                  {categoriesQuery.data?.items.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <TagInput
                available={tagsQuery.data?.items ?? []}
                value={tags ?? []}
                onChange={(ids) =>
                  form.setValue('tags', ids, { shouldValidate: true })
                }
                disabled={isBusy}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Media</Label>
            <MediaField
              value={media}
              onChange={(next) =>
                form.setValue('media', next, { shouldValidate: true })
              }
              onUploadingChange={setIsUploading}
              disabled={isBusy}
            />
          </div>
        </div>

        <div className="rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 pt-4 pb-4">
            <div className="flex items-center gap-1 rounded-md border border-border bg-muted/30 p-1">
              {LOCALE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={locale === tab.value}
                  onClick={() => setLocale(tab.value)}
                  className={cn(
                    'cursor-pointer rounded-sm px-4 py-1.5 font-mono text-xs font-semibold transition-colors',
                    locale === tab.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <p className="hidden text-xs text-muted-foreground sm:block">
              {locale === 'en' ? 'English content' : 'German content'}
            </p>
          </div>

          <div className="flex flex-col gap-5 p-5">
            <LocaleFields form={form} locale="en" hidden={locale !== 'en'} />
            <LocaleFields form={form} locale="de" hidden={locale !== 'de'} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/content/insights')}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {isSaving ? (
              <Dots dots={3} />
            ) : isEdit ? (
              'Save changes'
            ) : (
              'Save draft'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function LocaleFields({
  form,
  locale,
  hidden,
}: {
  form: UseFormReturn<InsightFormValues>;
  locale: Locale;
  hidden: boolean;
}) {
  const excerpt = useWatch({
    control: form.control,
    name: `content.${locale}.excerpt`,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `content.${locale}.body`,
  });
  const errors = form.formState.errors.content?.[locale];

  return (
    <div className={hidden ? 'hidden' : undefined}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${locale}-title`}>Title</Label>
          <Input
            id={`${locale}-title`}
            placeholder="e.g. Start with a decision"
            maxLength={200}
            {...form.register(`content.${locale}.title`)}
          />
          {errors?.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${locale}-slug`}>Slug</Label>
          <Input
            id={`${locale}-slug`}
            placeholder="e.g. start-with-a-decision"
            maxLength={100}
            {...form.register(`content.${locale}.slug`)}
          />
          <p className="text-xs text-muted-foreground">
            Lowercase letters, numbers, and hyphens.
          </p>
          {errors?.slug && (
            <p className="text-xs text-destructive">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <Label htmlFor={`${locale}-excerpt`}>Excerpt</Label>
        <Textarea
          id={`${locale}-excerpt`}
          placeholder="A short excerpt shown on the archive cards."
          maxLength={500}
          rows={3}
          {...form.register(`content.${locale}.excerpt`)}
        />
        <div className="flex justify-end">
          <p className="text-xs tabular-nums text-muted-foreground">
            {excerpt?.length ?? 0}/500
          </p>
        </div>
        {errors?.excerpt && (
          <p className="text-xs text-destructive">{errors.excerpt.message}</p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Label>Sections</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ section: '', content: '' })}
        >
          <PlusIcon data-icon="inline-start" />
          Add section
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Add as many sections as you like. Each section appears with its own
        heading on the article page.
      </p>

      <div className="mt-3 flex flex-col gap-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-md border border-border bg-muted/20 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor={`${locale}-section-${index}`}>
                Section {index + 1}
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => remove(index)}
              >
                <Trash2Icon data-icon="inline-start" />
                Remove
              </Button>
            </div>
            <Input
              id={`${locale}-section-${index}`}
              placeholder="Section title, e.g. Define the operating boundary"
              maxLength={200}
              className="mt-2"
              {...form.register(`content.${locale}.body.${index}.section`)}
            />
            <div className="mt-3">
              <SimpleEditor
                value={
                  form.getValues(`content.${locale}.body.${index}.content`) ??
                  ''
                }
                onChange={(html) =>
                  form.setValue(
                    `content.${locale}.body.${index}.content`,
                    html,
                    { shouldDirty: true },
                  )
                }
                ariaLabel={`Section ${index + 1} content (${locale})`}
              />
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No sections yet. Add your first section above.
          </p>
        )}
      </div>
    </div>
  );
}

function EditSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <Skeleton className="h-8 w-56 rounded-md" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full rounded-md" />
      <Skeleton className="h-40 w-full rounded-md" />
      <Skeleton className="h-96 w-full rounded-md" />
    </div>
  );
}
