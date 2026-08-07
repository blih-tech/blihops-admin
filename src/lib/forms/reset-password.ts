import { z } from 'zod';

type ResetPasswordValidationMessages = {
  newPasswordRequired: string;
  passwordMin: string;
  passwordMax: string;
  passwordRequirements: string;
  confirmRequired: string;
  confirmMismatch: string;
};

export function createResetPasswordSchema(
  messages: ResetPasswordValidationMessages,
) {
  return z
    .object({
      newPassword: z
        .string()
        .min(1, messages.newPasswordRequired)
        .min(8, messages.passwordMin)
        .max(128, messages.passwordMax)
        .refine(
          (value) =>
            /[a-z]/.test(value) &&
            /[A-Z]/.test(value) &&
            /\d/.test(value) &&
            /[^A-Za-z0-9]/.test(value),
          messages.passwordRequirements,
        ),
      confirmPassword: z.string().min(1, messages.confirmRequired),
    })
    .refine((data) => data.confirmPassword === data.newPassword, {
      message: messages.confirmMismatch,
      path: ['confirmPassword'],
    });
}

export type ResetPasswordFormValues = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;
