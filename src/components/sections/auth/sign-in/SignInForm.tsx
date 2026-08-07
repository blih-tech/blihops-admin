'use client';

import { useState } from 'react';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { ArrowRightIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { authInputClassName } from '@/components/sections/auth/auth-form-styles';
import { createSignInSchema, type SignInFormValues } from '@/lib/forms/sign-in';
import { cn } from '@/lib/utils';

export function SignInForm() {
  const reduceMotion = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: standardSchemaResolver(
      createSignInSchema({
        emailRequired: 'Enter your work email.',
        emailInvalid: 'Enter a valid email address.',
        emailMax: 'Keep the email under 254 characters.',
        passwordRequired: 'Enter your password.',
        passwordMin: 'Password must be at least 8 characters.',
      }),
    ),
    mode: 'onBlur',
    defaultValues: {
      workEmail: '',
      password: '',
      remember: true,
    },
  });

  function onSubmit(data: SignInFormValues) {
    console.info('Sign in submitted:', data);
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
          Account access
        </p>
        <h2 className="font-heading text-xl leading-snug font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">
          Sign in to your workspace
        </h2>
        <p className="text-[13px] leading-[1.5] text-muted-foreground">
          Use the email and password associated with your Blih Ops account.
        </p>
      </div>

      <form
        id="sign-in-form"
        className="mt-5 space-y-3.5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="space-y-1">
          <label
            className="text-xs font-medium text-foreground"
            htmlFor="workEmail"
          >
            Work email
          </label>
          <input
            id="workEmail"
            type="text"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={Boolean(errors.workEmail)}
            aria-describedby={errors.workEmail ? 'workEmail-error' : undefined}
            className={authInputClassName}
            {...register('workEmail')}
          />
          {errors.workEmail ? (
            <p
              id="workEmail-error"
              role="alert"
              className="text-xs leading-[1.4] text-destructive"
            >
              {errors.workEmail.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label
            className="text-xs font-medium text-foreground"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={cn(authInputClassName, 'pr-10')}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? (
                <EyeOffIcon className="size-4" aria-hidden="true" />
              ) : (
                <EyeIcon className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p
              id="password-error"
              role="alert"
              className="text-xs leading-[1.4] text-destructive"
            >
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 text-xs font-normal text-foreground">
            <input
              type="checkbox"
              className="size-4 rounded border-border accent-primary"
              {...register('remember')}
            />
            Keep me signed in
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-xs font-medium text-foreground transition-colors hover:text-primary"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="h-9 w-full">
          Sign in
          <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
        </Button>
      </form>
    </motion.div>
  );
}
