import { z } from 'zod';

type SignInValidationMessages = {
  emailRequired: string;
  emailInvalid: string;
  emailMax: string;
  passwordRequired: string;
  passwordMin: string;
};

export function createSignInSchema(messages: SignInValidationMessages) {
  return z.object({
    workEmail: z
      .string()
      .trim()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid)
      .max(254, messages.emailMax),
    password: z
      .string()
      .min(1, messages.passwordRequired)
      .min(8, messages.passwordMin),
    remember: z.boolean(),
  });
}

export type SignInFormValues = z.infer<ReturnType<typeof createSignInSchema>>;
