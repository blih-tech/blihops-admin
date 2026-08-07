'use client';

import { useEffect, useRef, useState } from 'react';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  Link2OffIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { Button, buttonVariants } from '@/components/ui/button';
import { authInputClassName } from '@/components/sections/auth/auth-form-styles';
import {
  createResetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/lib/forms/reset-password';
import { cn } from '@/lib/utils';

type ResetPasswordFormProps = {
  invalidToken: boolean;
};

export function ResetPasswordForm({ invalidToken }: ResetPasswordFormProps) {
  const reduceMotion = useReducedMotion();
  const [resetted, setResetted] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: standardSchemaResolver(
      createResetPasswordSchema({
        newPasswordRequired: 'Create a new password.',
        passwordMin: 'Password must be at least 8 characters.',
        passwordRequirements:
          'Password must include uppercase, lowercase, a number, and a symbol.',
        confirmRequired: 'Confirm your new password.',
        confirmMismatch: 'Passwords do not match.',
      }),
    ),
    mode: 'onBlur',
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (resetted) {
      successRef.current?.focus();
    }
  }, [resetted]);

  function onSubmit(data: ResetPasswordFormValues) {
    console.info('Password reset submitted:', data.newPassword);
    setResetted(true);
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

  if (invalidToken) {
    return (
      <motion.div
        key="invalid-token"
        className="flex flex-col gap-4"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.02em] text-destructive">
          <span
            className="size-1.5 rounded-full bg-destructive"
            aria-hidden="true"
          />
          Reset link unavailable
        </span>

        <div className="flex flex-col gap-2.5">
          <div className="flex size-[52px] items-center justify-center rounded-lg border border-destructive/40 bg-destructive/10">
            <Link2OffIcon
              className="size-[22px] text-destructive"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          <h2 className="font-heading text-xl leading-snug font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">
            This reset link is no longer valid
          </h2>
          <p className="text-[13px] leading-[1.5] text-muted-foreground">
            The link may have expired or already been used. Request a new link
            to reset your password.
          </p>
        </div>

        <div className="flex items-center gap-3.5 rounded-md border border-border bg-muted p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background">
            <ShieldCheckIcon
              className="size-[18px] text-primary"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-heading text-base font-semibold text-foreground">
              Reset links are single use
            </span>
            <span className="text-xs leading-[1.5] text-muted-foreground">
              Creating a new request safely replaces the expired link.
            </span>
          </div>
        </div>

        <Link
          href="/auth/forgot-password"
          className={buttonVariants({ size: 'lg', className: 'h-9 w-full' })}
        >
          Request new reset link
          <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
        </Link>

        <div className="flex justify-center pt-0.5">{backToSignIn}</div>
      </motion.div>
    );
  }

  if (resetted) {
    return (
      <motion.div
        ref={successRef}
        key="success"
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
          Password updated
        </span>

        <div className="flex flex-col gap-2.5">
          <div className="flex size-14 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
            <CheckIcon
              className="size-6 text-primary"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          <h2 className="font-heading text-xl leading-snug font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">
            Your password has been reset
          </h2>
          <p className="text-[13px] leading-[1.5] text-muted-foreground">
            Your new password is active and ready to use the next time you sign
            in.
          </p>
        </div>

        <Link
          href="/auth/sign-in"
          className={buttonVariants({ size: 'lg', className: 'h-9 w-full' })}
        >
          Go to sign in
          <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
        </Link>

        <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-normal text-muted-foreground">
          <KeyRoundIcon
            className="size-3.5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          Use the password you just created.
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      id="reset-password-form"
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.02em] text-primary">
        <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
        Reset link verified
      </span>

      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl leading-snug font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">
          Create a new password
        </h2>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label
            className="text-xs font-medium text-foreground"
            htmlFor="newPassword"
          >
            New password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a secure password"
              aria-invalid={Boolean(errors.newPassword)}
              aria-describedby={
                errors.newPassword ? 'newPassword-error' : undefined
              }
              className={cn(authInputClassName, 'pr-10')}
              {...register('newPassword')}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((v) => !v)}
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              {showNewPassword ? (
                <EyeOffIcon className="size-4" aria-hidden="true" />
              ) : (
                <EyeIcon className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.newPassword ? (
            <p
              id="newPassword-error"
              role="alert"
              className="text-xs leading-[1.4] text-destructive"
            >
              {errors.newPassword.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label
            className="text-xs font-medium text-foreground"
            htmlFor="confirmPassword"
          >
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat your new password"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword ? 'confirmPassword-error' : undefined
              }
              className={cn(authInputClassName, 'pr-10')}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="size-4" aria-hidden="true" />
              ) : (
                <EyeIcon className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.confirmPassword ? (
            <p
              id="confirmPassword-error"
              role="alert"
              className="text-xs leading-[1.4] text-destructive"
            >
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>
      </div>

      <p className="text-xs leading-[1.4] text-muted-foreground">
        Min. 8 characters
      </p>

      <Button type="submit" size="lg" className="h-9 w-full">
        Reset password
        <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
      </Button>

      <div className="flex justify-center pt-0.5">{backToSignIn}</div>
    </motion.form>
  );
}
