import { z } from 'zod';

export const logoFormSchema = z.object({
  imageUrl: z
    .string()
    .min(1, 'Logo image is required')
    .max(2048, 'Image URL must be at most 2048 characters'),
  alt: z
    .string()
    .min(1, 'Alt text is required')
    .max(160, 'Alt text must be at most 160 characters'),
});

export type LogoFormValues = z.infer<typeof logoFormSchema>;
