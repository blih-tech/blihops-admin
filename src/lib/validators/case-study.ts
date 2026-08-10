import { z } from 'zod';

const mediaSchema = z
  .object({
    type: z.enum(['image', 'video']),
    url: z
      .string()
      .url('Enter a valid URL')
      .max(2048, 'Keep the URL under 2048 characters'),
    alt: z.string().trim().max(160).optional(),
  })
  .optional();

export const caseStudyFormSchema = z.object({
  client: z
    .string()
    .trim()
    .min(1, 'Client is required')
    .max(200, 'Keep the client name under 200 characters'),
  categoryId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  media: mediaSchema,
  content: z.object({
    en: z
      .object({
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
        summary: z
          .string()
          .trim()
          .max(500, 'Keep the summary under 500 characters')
          .optional(),
        body: z
          .object({
            challenge: z.string().max(200_000).optional(),
            approach: z.string().max(200_000).optional(),
            outcome: z.string().max(200_000).optional(),
          })
          .optional(),
      })
      .optional(),
    de: z
      .object({
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
        summary: z
          .string()
          .trim()
          .max(500, 'Keep the summary under 500 characters')
          .optional(),
        body: z
          .object({
            challenge: z.string().max(200_000).optional(),
            approach: z.string().max(200_000).optional(),
            outcome: z.string().max(200_000).optional(),
          })
          .optional(),
      })
      .optional(),
  }),
});

export type CaseStudyFormValues = z.infer<typeof caseStudyFormSchema>;
