import { z } from 'zod';

type ForgotPasswordValidationMessages = {
  emailRequired: string;
  emailInvalid: string;
  emailMax: string;
};

export function createForgotPasswordSchema(
  messages: ForgotPasswordValidationMessages,
) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid)
      .max(254, messages.emailMax),
  });
}

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;
