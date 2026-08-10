import { z } from 'zod';

const faqLocaleContentSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, 'Question is required')
    .max(500, 'Keep the question under 500 characters'),
  answer: z
    .string()
    .trim()
    .min(1, 'Answer is required')
    .max(4000, 'Keep the answer under 4000 characters'),
});

export const faqFormSchema = z.object({
  en: faqLocaleContentSchema,
  de: faqLocaleContentSchema,
  displayOrder: z
    .number({ error: 'Use a whole number' })
    .int('Use a whole number')
    .min(0, 'Display order must be zero or greater'),
});

export type FaqFormValues = z.infer<typeof faqFormSchema>;
