import { z } from 'zod';

export const testimonialFormSchema = z.object({
  avatarUrl: z
    .string()
    .min(1, 'Avatar image is required')
    .max(2048, 'Avatar URL must be at most 2048 characters'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
  role: z
    .string()
    .min(1, 'Role is required')
    .max(100, 'Role must be at most 100 characters'),
  company: z
    .string()
    .min(1, 'Company is required')
    .max(100, 'Company must be at most 100 characters'),
  quote: z
    .string()
    .min(1, 'Quote is required')
    .max(2000, 'Quote must be at most 2000 characters'),
});

export type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;
