'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon } from 'lucide-react';

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
  createCaseStudy,
  getCaseStudy,
  updateCaseStudy,
  type CaseStudy,
  type CaseStudyLocaleContent,
  type CreateCaseStudyPayload,
  type UpdateCaseStudyPayload,
} from '@/lib/api/content/case-studies';
import { listCategories } from '@/lib/api/content/categories';
import { listTags } from '@/lib/api/content/tags';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  caseStudyFormSchema,
  type CaseStudyFormValues,
} from '@/lib/validators/case-study';

type Locale = 'en' | 'de';

const LOCALE_TABS: { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'de', label: 'DE' },
];

const SECTION_LABELS: {
  key: 'challenge' | 'approach' | 'outcome';
  label: string;
}[] = [
  { key: 'challenge', label: 'Challenge' },
  { key: 'approach', label: 'Approach' },
  { key: 'outcome', label: 'Outcome' },
];

const LIST_KEY = ['content', 'case-studies'] as const;

function localeDefaults(locale?: Partial<CaseStudyLocaleContent>): {
  title: string;
  slug: string;
  summary: string;
  body: { challenge: string; approach: string; outcome: string };
} {
  return {
    title: locale?.title ?? '',
    slug: locale?.slug ?? '',
    summary: locale?.summary ?? '',
    body: {
      challenge: locale?.body?.challenge ?? '',
      approach: locale?.body?.approach ?? '',
      outcome: locale?.body?.outcome ?? '',
    },
  };
}

function buildPayload(values: CaseStudyFormValues): CreateCaseStudyPayload {
  const content: CreateCaseStudyPayload['content'] = {};

  for (const locale of ['en', 'de'] as const) {
    const localeContent = values.content[locale];
    if (!localeContent) continue;
    const body = localeContent.body;
    const hasBody = Boolean(body?.challenge || body?.approach || body?.outcome);
    const hasAny = Boolean(
      localeContent.title ||
      localeContent.slug ||
      localeContent.summary ||
      hasBody,
    );
    if (hasAny) {
      content[locale] = {
        ...(localeContent.title ? { title: localeContent.title } : {}),
        ...(localeContent.slug ? { slug: localeContent.slug } : {}),
        ...(localeContent.summary ? { summary: localeContent.summary } : {}),
        ...(hasBody
          ? {
              body: {
                challenge: body?.challenge ?? '',
                approach: body?.approach ?? '',
                outcome: body?.outcome ?? '',
              },
            }
          : {}),
      };
    }
  }

  return {
    client: values.client,
    ...(values.categoryId ? { categoryId: values.categoryId } : {}),
    ...(values.media ? { media: values.media } : {}),
    ...(values.tags && values.tags.length > 0 ? { tags: values.tags } : {}),
    ...(Object.keys(content).length > 0 ? { content } : {}),
  };
}

function buildEditPatches(
  values: CaseStudyFormValues,
): UpdateCaseStudyPayload[] {
  const patches: UpdateCaseStudyPayload[] = [
    {
      client: values.client,
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
    const body = localeContent.body;
    const hasBody = Boolean(body?.challenge || body?.approach || body?.outcome);
    const content: Partial<CaseStudyLocaleContent> = {};
    if (localeContent.title) content.title = localeContent.title;
    if (localeContent.slug) content.slug = localeContent.slug;
    if (localeContent.summary) content.summary = localeContent.summary;
    if (hasBody) {
      content.body = {
        challenge: body?.challenge ?? '',
        approach: body?.approach ?? '',
        outcome: body?.outcome ?? '',
      };
    }
    if (Object.keys(content).length > 0) {
      patches.push({ locale, content });
    }
  }

  return patches;
}

export function CaseStudyForm({ caseStudyId }: { caseStudyId?: string }) {
  const isEdit = Boolean(caseStudyId);
  const detailQuery = useQuery({
    queryKey: ['content', 'case-studies', 'detail', caseStudyId],
    queryFn: () => getCaseStudy(caseStudyId as string),
    enabled: isEdit,
  });

  if (isEdit && detailQuery.isPending) {
    return <EditSkeleton />;
  }

  if (isEdit && detailQuery.isError) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <ErrorState
          title="Failed to load case study"
          message={detailQuery.error.message}
          onRetry={() => {
            void detailQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <CaseStudyFormFields
      key={caseStudyId ?? 'new'}
      initialData={detailQuery.data?.data ?? null}
    />
  );
}

function CaseStudyFormFields({
  initialData,
}: {
  initialData: CaseStudy | null;
}) {
  const isEdit = initialData !== null;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [locale, setLocale] = useState<Locale>('en');
  const [isUploading, setIsUploading] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ['content', 'categories'],
    queryFn: listCategories,
  });
  const tagsQuery = useQuery({
    queryKey: ['content', 'tags'],
    queryFn: listTags,
  });

  const form = useForm<CaseStudyFormValues>({
    resolver: zodResolver(caseStudyFormSchema),
    defaultValues: {
      client: initialData?.client ?? '',
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

  const client = useWatch({ control: form.control, name: 'client' });
  const categoryId = useWatch({ control: form.control, name: 'categoryId' });
  const tags = useWatch({ control: form.control, name: 'tags' });
  const media = useWatch({ control: form.control, name: 'media' });
  const editId = initialData?.id ?? null;

  const createMutation = useMutation({
    mutationFn: (values: CaseStudyFormValues) =>
      createCaseStudy(buildPayload(values)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
      toastSuccess('Draft created');
      router.push('/content/case-studies');
    },
    onError: (err) => {
      toastError('Failed to create case study', err.message);
    },
  });

  const editMutation = useMutation({
    mutationFn: async (values: CaseStudyFormValues) => {
      if (editId === null) {
        throw new Error('Case study not found');
      }
      const patches = buildEditPatches(values);
      for (const patch of patches) {
        await updateCaseStudy(editId, patch);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LIST_KEY });
      toastSuccess('Case study updated');
      router.push('/content/case-studies');
    },
    onError: (err) => {
      toastError('Failed to update case study', err.message);
    },
  });

  const isSaving = createMutation.isPending || editMutation.isPending;
  const canSubmit = Boolean(client.trim()) && !isUploading && !isSaving;

  function handleSubmit(values: CaseStudyFormValues) {
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
            href="/content/case-studies"
            className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to case studies
          </Link>
          <h1 className="mt-2 font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {isEdit ? 'Edit Case Study' : 'Add Case Study'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Both English and German are required before publishing.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/content/case-studies')}
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
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Input
              id="client"
              placeholder="e.g. Northline SaaS"
              maxLength={200}
              aria-invalid={Boolean(form.formState.errors.client)}
              {...form.register('client')}
            />
            {form.formState.errors.client && (
              <p className="text-xs text-destructive">
                {form.formState.errors.client.message}
              </p>
            )}
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
            onClick={() => router.push('/content/case-studies')}
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
  form: UseFormReturn<CaseStudyFormValues>;
  locale: Locale;
  hidden: boolean;
}) {
  const summary = useWatch({
    control: form.control,
    name: `content.${locale}.summary`,
  });
  const errors = form.formState.errors.content?.[locale];

  return (
    <div className={hidden ? 'hidden' : undefined}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${locale}-title`}>Title</Label>
          <Input
            id={`${locale}-title`}
            placeholder="e.g. Scaling support across channels"
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
            placeholder="e.g. scaling-support-across-channels"
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
        <Label htmlFor={`${locale}-summary`}>Summary</Label>
        <Textarea
          id={`${locale}-summary`}
          placeholder="A short summary shown on the archive cards."
          maxLength={500}
          rows={3}
          {...form.register(`content.${locale}.summary`)}
        />
        <div className="flex justify-end">
          <p className="text-xs tabular-nums text-muted-foreground">
            {summary?.length ?? 0}/500
          </p>
        </div>
        {errors?.summary && (
          <p className="text-xs text-destructive">{errors.summary.message}</p>
        )}
      </div>

      {SECTION_LABELS.map((section) => (
        <div key={section.key} className="mt-5 space-y-2">
          <Label htmlFor={`${locale}-${section.key}`}>{section.label}</Label>
          <SimpleEditor
            value={
              form.getValues(`content.${locale}.body.${section.key}`) ?? ''
            }
            onChange={(html) =>
              form.setValue(`content.${locale}.body.${section.key}`, html, {
                shouldDirty: true,
              })
            }
            ariaLabel={`${section.label} body (${locale})`}
          />
        </div>
      ))}
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
