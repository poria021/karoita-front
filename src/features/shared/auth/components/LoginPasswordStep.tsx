'use client';

import { LogIn, Smartphone } from 'lucide-react';

import { Button } from '@/components/ui/button';

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
        <Button
          type="button"
          variant="link"
          onClick={switchToForgotMode}
          className="h-auto p-0 text-[11px] font-bold text-slate-500 hover:text-brand-500"
        >
          رمز خود را فراموش کردم
        </Button>

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

      <Button
        type="button"
        variant="outline"
        onClick={switchToOtpMode}
        className="h-auto w-full gap-1.5 rounded-xl border-slate-200 bg-slate-50 py-2.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      >
        <Smartphone className="size-3.5" aria-hidden="true" />
        <span>ورود با رمز یکبار مصرف (OTP)</span>
      </Button>
    </form>
  );
}
