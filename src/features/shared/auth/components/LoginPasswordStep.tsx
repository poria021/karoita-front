'use client';

import { LogIn, Smartphone } from 'lucide-react';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { MobileNumberField } from './fields/MobileNumberField';
import { PasswordField } from './fields/PasswordField';

interface LoginPasswordStepProps {
  login: UseLoginFormReturn;
}

/** Rendered while `login.mode === 'password'`: mobile + password credential form. */
export function LoginPasswordStep({ login }: LoginPasswordStepProps) {
  const { passwordForm, submitPassword, isSubmittingPassword, switchToOtpMode, switchToForgotMode } = login;
  const { register, watch, formState } = passwordForm;

  const mobileValue = watch('mobile');
  const passwordValue = watch('password');

  return (
    <form onSubmit={submitPassword} className="space-y-4" noValidate>
      <MobileNumberField
        id="login-mobile"
        registration={register('mobile')}
        currentValue={mobileValue}
        errorMessage={formState.errors.mobile?.message}
        disabled={isSubmittingPassword}
      />

      <PasswordField
        id="login-password"
        label="رمز عبور"
        registration={register('password')}
        currentValue={passwordValue}
        errorMessage={formState.errors.password?.message}
      />

      <div className="flex items-center justify-between py-1">
        <button
          type="button"
          onClick={switchToForgotMode}
          className="text-[11px] font-bold text-slate-500 transition-colors hover:text-brand-500"
        >
          رمز خود را فراموش کردم
        </button>

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
        isReady={formState.isValid}
        isLoading={isSubmittingPassword}
        loadingLabel="در حال ورود..."
        icon={<LogIn className="size-4" aria-hidden="true" />}
      >
        ورود به سامانه
      </AuthSubmitButton>

      <button
        type="button"
        onClick={switchToOtpMode}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-[11px] font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
      >
        <Smartphone className="size-3.5" aria-hidden="true" />
        <span>ورود با رمز یکبار مصرف (OTP)</span>
      </button>
    </form>
  );
}
