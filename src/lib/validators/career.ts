import { z } from 'zod';

export const careerFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(150, 'Keep the title under 150 characters'),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers, and hyphens',
    )
    .max(100, 'Keep the slug under 100 characters'),
  department: z
    .string()
    .trim()
    .min(1, 'Department is required')
    .max(500, 'Keep the department under 500 characters'),
  location: z
    .string()
    .trim()
    .min(1, 'Location is required')
    .max(500, 'Keep the location under 500 characters'),
  employmentType: z
    .string()
    .trim()
    .min(1, 'Employment type is required')
    .max(500, 'Keep the employment type under 500 characters'),
  summary: z
    .string()
    .trim()
    .min(1, 'Summary is required')
    .max(500, 'Keep the summary under 500 characters'),
  overview: z.array(z.object({ value: z.string() })),
  responsibilities: z.array(z.object({ value: z.string() })),
  requirements: z.array(z.object({ value: z.string() })),
});

export type CareerFormValues = z.infer<typeof careerFormSchema>;
