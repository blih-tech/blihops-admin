import { z } from 'zod';

const sectionSchema = z.object({
  section: z.string().max(200, 'Keep the section title under 200 characters'),
  content: z.string().max(200_000),
});

const localeContentSchema = z.object({
  title: z
    .string()
    .trim()
    .max(200, 'Keep the title under 200 characters')
    .optional(),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers, and hyphens',
    )
    .max(100, 'Keep the slug under 100 characters')
    .optional()
    .or(z.literal('')),
  excerpt: z
    .string()
    .trim()
    .max(500, 'Keep the excerpt under 500 characters')
    .optional(),
  body: z.array(sectionSchema).optional(),
});

export const insightFormSchema = z.object({
  author: z
    .string()
    .trim()
    .min(1, 'Author is required')
    .max(100, 'Keep the author name under 100 characters'),
  readTimeMinutes: z
    .union([
      z.number().int().min(1, 'Read time must be at least 1 minute'),
      z.nan(),
    ])
    .optional(),
  categoryId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  media: z
    .object({
      type: z.enum(['image', 'video']),
      url: z
        .string()
        .url('Enter a valid URL')
        .max(2048, 'Keep the URL under 2048 characters'),
      alt: z.string().trim().max(160).optional(),
    })
    .optional(),
  content: z.object({
    en: localeContentSchema.optional(),
    de: localeContentSchema.optional(),
  }),
});

export type InsightFormValues = z.infer<typeof insightFormSchema>;
