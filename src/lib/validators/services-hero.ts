import { z } from 'zod';

export const servicesHeroFormSchema = z.object({
  videoUrl: z
    .string()
    .min(1, 'Hero video is required')
    .max(2048, 'Video URL must be at most 2048 characters'),
  coverUrl: z
    .string()
    .min(1, 'Cover image is required')
    .max(2048, 'Cover URL must be at most 2048 characters'),
  altLabel: z
    .string()
    .min(1, 'Alt label is required')
    .max(160, 'Alt label must be at most 160 characters'),
});

export type ServicesHeroFormValues = z.infer<typeof servicesHeroFormSchema>;
