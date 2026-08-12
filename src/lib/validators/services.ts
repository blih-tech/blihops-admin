import { z } from 'zod';

import { serviceIcons } from '@/lib/api/content/services';

const serviceSlugSchema = z
  .string()
  .trim()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use lowercase letters, numbers, and hyphens',
  )
  .max(100, 'Keep the slug under 100 characters');

const serviceTextFieldSchema = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `Keep the ${label.toLowerCase()} under ${max} characters`);

/**
 * Features are capped at 6 in the admin UI; the API accepts up to 10
 * (serviceFeaturesSchema) so records created elsewhere keep their features.
 * Stored as `{ value }` objects in the form (react-hook-form field arrays
 * require object items) and mapped to plain strings in the API payload.
 */
const serviceFeaturesSchema = z
  .array(
    z.object({
      value: z
        .string()
        .trim()
        .min(1, 'Feature entries cannot be empty')
        .max(200, 'Keep features under 200 characters'),
    }),
  )
  .min(1, 'At least one feature is required')
  .max(6, 'Keep the feature list under 6 entries');

const serviceLocaleContentSchema = z.object({
  slug: serviceSlugSchema,
  title: serviceTextFieldSchema('Title', 150),
  subtitle: serviceTextFieldSchema('Subtitle', 300),
  shortDescription: serviceTextFieldSchema('Short description', 300),
  details: serviceTextFieldSchema('Details', 500),
  tag: serviceTextFieldSchema('Tag', 80),
  body: serviceTextFieldSchema('Body', 5000),
  features: serviceFeaturesSchema,
  whoThisIsFor: serviceTextFieldSchema('Who this is for', 500),
});

export const serviceFormSchema = z.object({
  icon: z.enum(serviceIcons),
  imageUrl: z.string().trim().min(1, 'Cover image is required'),
  alt: z
    .string()
    .trim()
    .min(1, 'Alt text is required')
    .max(160, 'Keep the alt text under 160 characters'),
  displayOrder: z
    .number({ error: 'Use a whole number' })
    .int('Use a whole number')
    .min(0, 'Display order must be zero or greater'),
  en: serviceLocaleContentSchema,
  de: serviceLocaleContentSchema,
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
