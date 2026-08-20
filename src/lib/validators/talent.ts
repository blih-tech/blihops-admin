import { z } from 'zod';

export const talentApplicationStatuses = [
  'NEW',
  'UNDER_REVIEW',
  'SCREENING',
  'TECHNICAL_ASSESSMENT',
  'ENGLISH_ASSESSMENT',
  'REMOTE_READINESS_ASSESSMENT',
  'APPROVED',
  'COMPLETION_REQUESTED',
  'COMPLETION_SUBMITTED',
  'PROFILE_CREATED',
  'REJECTED',
  'ARCHIVED',
] as const;

export const talentApplicationStatusSchema = z.enum(talentApplicationStatuses);

export const talentApplicationNotesSchema = z.object({
  internalNotes: z.string().max(5000, 'Keep notes under 5000 characters'),
});

export type TalentApplicationNotesValues = z.infer<
  typeof talentApplicationNotesSchema
>;

export const createTalentProfileSchema = z.object({
  seniority: z
    .string()
    .trim()
    .min(1, 'Seniority is required')
    .max(80, 'Keep seniority under 80 characters'),
  englishLevel: z
    .string()
    .trim()
    .min(1, 'English level is required')
    .max(20, 'Keep English level under 20 characters'),
  clientMonthlyRateEur: z
    .string()
    .trim()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      'Enter a valid EUR amount (e.g. 2500 or 2500.00)',
    ),
  assessmentSummary: z
    .string()
    .trim()
    .min(1, 'Assessment summary is required')
    .max(2000, 'Keep summary under 2000 characters'),
  internalNotes: z
    .string()
    .trim()
    .min(1, 'Internal notes are required')
    .max(5000, 'Keep notes under 5000 characters'),
});

export type CreateTalentProfileValues = z.infer<
  typeof createTalentProfileSchema
>;

export const updateTalentProfileSchema = z
  .object({
    seniority: z
      .string()
      .trim()
      .min(1, 'Seniority is required')
      .max(80, 'Keep seniority under 80 characters')
      .optional(),
    englishLevel: z
      .string()
      .trim()
      .min(1, 'English level is required')
      .max(20, 'Keep English level under 20 characters')
      .optional(),
    clientMonthlyRateEur: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid EUR amount')
      .optional(),
    assessmentSummary: z
      .string()
      .trim()
      .min(1, 'Assessment summary is required')
      .max(2000, 'Keep summary under 2000 characters')
      .optional(),
    internalNotes: z
      .string()
      .trim()
      .min(1, 'Internal notes are required')
      .max(5000, 'Keep notes under 5000 characters')
      .optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'Provide at least one field');

export type UpdateTalentProfileValues = z.infer<
  typeof updateTalentProfileSchema
>;

export const talentProfileVisibilitySchema = z.enum(['HIDDEN', 'VISIBLE']);
export const talentAccountStatusSchema = z.enum([
  'PENDING_INVITATION',
  'ACTIVE',
  'DEACTIVATED',
]);
