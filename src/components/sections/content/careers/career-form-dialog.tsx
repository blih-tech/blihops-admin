'use client';

import { useForm, useWatch } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dots } from '@/components/shared/Dots';
import { ErrorState } from '@/components/shared/ErrorState';
import { CareerListSection } from '@/components/sections/content/careers/career-list-section';
import {
  getCareer,
  type Career,
  type CareerListItem,
} from '@/lib/api/content/careers';
import {
  careerFormSchema,
  type CareerFormValues,
} from '@/lib/validators/career';

type CareerFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  career?: CareerListItem | null;
  initialValues?: CareerFormValues | null;
  isSaving: boolean;
  onSave: (values: CareerFormValues) => void;
};

function emptyValues(): CareerFormValues {
  return {
    title: '',
    slug: '',
    department: '',
    location: '',
    employmentType: '',
    summary: '',
    overview: [{ value: '' }],
    responsibilities: [{ value: '' }],
    requirements: [{ value: '' }],
  };
}

function detailToValues(career: Career): CareerFormValues {
  return {
    title: career.title,
    slug: career.slug,
    department: career.department,
    location: career.location,
    employmentType: career.employmentType,
    summary: career.summary,
    overview: career.overview.map((value) => ({ value })),
    responsibilities: career.responsibilities.map((value) => ({ value })),
    requirements: career.requirements.map((value) => ({ value })),
  };
}

export function CareerFormDialog({
  open,
  onOpenChange,
  career,
  initialValues,
  isSaving,
  onSave,
}: CareerFormDialogProps) {
  const isEdit = Boolean(career);

  const detailQuery = useQuery({
    queryKey: ['content', 'careers', 'detail', career?.id],
    queryFn: () => getCareer(career?.id as string),
    enabled: Boolean(open && career),
  });

  const detail = detailQuery.data?.data;
  const prefilled =
    initialValues ?? (detail ? detailToValues(detail) : emptyValues());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-md sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit career role' : 'Add career role'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the role details. Changes go live for public visitors only when the role is active.'
              : 'Create a new role. All sections are required before the role can be created.'}
          </DialogDescription>
        </DialogHeader>

        {isEdit && detailQuery.isPending ? (
          <div className="flex flex-col gap-4 py-4">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-28 w-full rounded-md" />
          </div>
        ) : isEdit && detailQuery.isError ? (
          <div className="py-2">
            <ErrorState
              title="Failed to load career role"
              message={detailQuery.error.message}
              onRetry={() => {
                void detailQuery.refetch();
              }}
            />
          </div>
        ) : (
          <CareerFormContent
            key={career?.id ?? 'new'}
            isEdit={isEdit}
            prefilled={prefilled}
            isSaving={isSaving}
            onOpenChange={onOpenChange}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CareerFormContent({
  isEdit,
  prefilled,
  isSaving,
  onOpenChange,
  onSave,
}: {
  isEdit: boolean;
  prefilled: CareerFormValues;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: CareerFormValues) => void;
}) {
  const form = useForm<CareerFormValues>({
    resolver: zodResolver(careerFormSchema),
    defaultValues: prefilled,
  });

  const title = useWatch({ control: form.control, name: 'title' });
  const slug = useWatch({ control: form.control, name: 'slug' });
  const department = useWatch({ control: form.control, name: 'department' });
  const location = useWatch({ control: form.control, name: 'location' });
  const employmentType = useWatch({
    control: form.control,
    name: 'employmentType',
  });
  const summary = useWatch({ control: form.control, name: 'summary' });
  const overview = useWatch({ control: form.control, name: 'overview' });
  const responsibilities = useWatch({
    control: form.control,
    name: 'responsibilities',
  });
  const requirements = useWatch({
    control: form.control,
    name: 'requirements',
  });

  const scalarsValid = careerFormSchema
    .pick({
      title: true,
      slug: true,
      department: true,
      location: true,
      employmentType: true,
      summary: true,
    })
    .safeParse({
      title,
      slug,
      department,
      location,
      employmentType,
      summary,
    }).success;

  const listsReady = [overview, responsibilities, requirements].every((list) =>
    (list ?? []).some((entry) => entry.value.trim().length > 0),
  );

  const canSubmit = scalarsValid && listsReady && !isSaving;

  function handleSubmit(values: CareerFormValues) {
    onSave(values);
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-col gap-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="career-title">Title</Label>
          <Input
            id="career-title"
            placeholder="e.g. Senior Backend Engineer"
            maxLength={150}
            {...form.register('title')}
          />
          {form.formState.errors.title && (
            <p className="text-xs text-destructive">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="career-slug">Slug</Label>
          <Input
            id="career-slug"
            placeholder="e.g. senior-backend-engineer"
            maxLength={100}
            {...form.register('slug')}
          />
          <p className="text-xs text-muted-foreground">
            Lowercase letters, numbers, and hyphens.
          </p>
          {form.formState.errors.slug && (
            <p className="text-xs text-destructive">
              {form.formState.errors.slug.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="career-department">Department</Label>
          <Input
            id="career-department"
            placeholder="e.g. Engineering"
            maxLength={500}
            {...form.register('department')}
          />
          {form.formState.errors.department && (
            <p className="text-xs text-destructive">
              {form.formState.errors.department.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="career-location">Location</Label>
          <Input
            id="career-location"
            placeholder="e.g. Addis Ababa (Remote)"
            maxLength={500}
            {...form.register('location')}
          />
          {form.formState.errors.location && (
            <p className="text-xs text-destructive">
              {form.formState.errors.location.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="career-employment-type">Employment type</Label>
          <Input
            id="career-employment-type"
            placeholder="e.g. Full-time"
            maxLength={500}
            {...form.register('employmentType')}
          />
          {form.formState.errors.employmentType && (
            <p className="text-xs text-destructive">
              {form.formState.errors.employmentType.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="career-summary">Summary</Label>
        <Textarea
          id="career-summary"
          placeholder="A short summary shown on the careers cards."
          maxLength={500}
          rows={3}
          {...form.register('summary')}
        />
        {form.formState.errors.summary && (
          <p className="text-xs text-destructive">
            {form.formState.errors.summary.message}
          </p>
        )}
      </div>

      <CareerListSection
        form={form}
        name="overview"
        label="Overview"
        hint="A few short paragraphs describing the role."
        placeholder="Describe the role in a few sentences…"
      />
      <CareerListSection
        form={form}
        name="responsibilities"
        label="Responsibilities"
        hint="What the role is expected to deliver."
        placeholder="e.g. Build and maintain the core API…"
      />
      <CareerListSection
        form={form}
        name="requirements"
        label="Requirements"
        hint="Skills and experience the candidate must have."
        placeholder="e.g. 3+ years with TypeScript…"
      />

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
          {isSaving ? (
            <Dots dots={3} />
          ) : isEdit ? (
            'Save changes'
          ) : (
            'Create role'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
