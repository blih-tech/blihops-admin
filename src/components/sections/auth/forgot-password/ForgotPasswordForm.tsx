'use client';

import { useEffect, useRef, useState } from 'react';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  InboxIcon,
  MailCheckIcon,
  MailIcon,
  RotateCwIcon,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  createForgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/lib/forms/forgot-password';

export function ForgotPasswordForm() {
  const reduceMotion = useReducedMotion();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: standardSchemaResolver(
      createForgotPasswordSchema({
        emailRequired: 'Enter your email address.',
        emailInvalid: 'Enter a valid email address.',
        emailMax: 'Keep the email under 254 characters.',
      }),
    ),
    mode: 'onBlur',
    defaultValues: { email: '' },
  });

  useEffect(() => {
    if (sentTo) {
      successRef.current?.focus();
    }
  }, [sentTo]);

  function onSubmit(data: ForgotPasswordFormValues) {
    console.info('Password reset requested for:', data.email);
    setSentTo(data.email);
  }

  function onResend() {
    console.info('Password reset email resent to:', sentTo);
  }

  const backToSignIn = (
    <Link
      href="/auth/sign-in"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
    >
      <ArrowLeftIcon className="size-3.5" aria-hidden="true" />
      Back to sign in
    </Link>
  );

  if (sentTo) {
    return (
      <motion.div
        ref={successRef}
        role="status"
        aria-live="polite"
        tabIndex={-1}
        className="flex flex-col gap-4 outline-none"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.02em] text-primary">
          <span
            className="size-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
          Reset email sent
        </span>

        <div className="flex flex-col gap-2.5">
          <div className="flex size-14 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
            <MailCheckIcon
              className="size-6 text-primary"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          <h2 className="font-heading text-xl leading-snug font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">
            Check your email
          </h2>
          <p className="text-[13px] leading-[1.5] text-muted-foreground">
            If the address matches a Blih Ops account, password reset
            instructions are on the way.
          </p>
        </div>

        <div className="flex items-center gap-3.5 rounded-md border border-border bg-muted p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background">
            <MailIcon
              className="size-[18px] text-primary"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-mono text-[9px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Email entered
            </span>
            <span className="text-[13px] font-medium break-all text-foreground">
              {sentTo}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-md border border-border bg-muted p-3.5">
          <InboxIcon
            className="size-4 shrink-0 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-[11px] leading-[1.5] text-muted-foreground">
            Check your spam or junk folder if the email doesn&apos;t appear
            after a few minutes.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-9 w-full"
          onClick={onResend}
        >
          <RotateCwIcon data-icon="inline-start" aria-hidden="true" />
          Resend email
        </Button>

        <div className="flex justify-center pt-0.5">{backToSignIn}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="flex flex-col gap-1">
        <p className="font-mono text-[10px] font-semibold tracking-[0.11em] text-primary uppercase">
          Password recovery
        </p>
        <h2 className="font-heading text-xl leading-snug font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">
          Reset your password
        </h2>
        <p className="text-[13px] leading-[1.5] text-muted-foreground">
          Enter the email associated with your Blih Ops account. We&apos;ll send
          password reset instructions if it matches an account.
        </p>
      </div>

      <form
        id="forgot-password-form"
        className="mt-5 flex flex-col gap-3.5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <FieldGroup className="gap-3.5">
          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel
              htmlFor="email"
              className="text-xs font-medium text-foreground"
            >
              Email address
            </FieldLabel>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="name@company.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            <FieldError id="email-error" errors={[errors.email]} />
          </Field>
        </FieldGroup>

        <Button type="submit" size="lg" className="h-9 w-full">
          Send reset link
          <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
        </Button>

        <div className="flex justify-center pt-0.5">{backToSignIn}</div>
      </form>
    </motion.div>
  );
}
