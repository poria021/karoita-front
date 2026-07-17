'use client';

import { LogIn, Smartphone } from 'lucide-react';

import { KvButton } from '@/components/shared/KvButton';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { MobileNumberField } from './fields/MobileNumberField';
import { PasswordField } from './fields/PasswordField';

interface LoginPasswordStepProps {
  login: UseLoginFormReturn;
}

/** Rendered while `login.mode === 'password'`: mobile + password credential form. */
export function LoginPasswordStep({ login }: LoginPasswordStepProps) {
  const {
    passwordForm,
    submitPassword,
    isSubmittingPassword,
    switchToOtpMode,
    switchToForgotMode,
  } = login;
  const { register, formState } = passwordForm;

  return (
    <form onSubmit={submitPassword} className="space-y-kv-group" noValidate>
      <MobileNumberField
        id="login-mobile"
        registration={register('mobile')}
        errorMessage={formState.errors.mobile?.message}
        disabled={isSubmittingPassword}
      />

      <PasswordField
        id="login-password"
        label="رمز عبور"
        registration={register('password')}
        errorMessage={formState.errors.password?.message}
      />

      <div className="flex items-center justify-between py-1">
        <KvButton
          type="button"
          color="neutral"
          appearance="text"
          size="sm"
          onClick={switchToForgotMode}
        >
          رمز خود را فراموش کردم
        </KvButton>

        <label
          htmlFor="login-remember"
          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 select-none"
        >
          <span>مرا به خاطر بسپار</span>
          <input
            id="login-remember"
            type="checkbox"
            {...register('remember')}
            className="size-4 cursor-pointer rounded border-slate-300 accent-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          />
        </label>
      </div>

      <AuthSubmitButton
        isLoading={isSubmittingPassword}
        loadingLabel="در حال ورود..."
        icon={<LogIn className="size-4" aria-hidden="true" />}
      >
        ورود به سامانه
      </AuthSubmitButton>

      <KvButton
        type="button"
        appearance="secondary"
        size="lg"
        fullWidth
        icon={<Smartphone className="size-3.5" aria-hidden="true" />}
        onClick={switchToOtpMode}
      >
        ورود با رمز یکبار مصرف (OTP)
      </KvButton>
    </form>
  );
}
