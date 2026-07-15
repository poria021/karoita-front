'use client';

import { KeyRound } from 'lucide-react';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { MobileNumberField } from './fields/MobileNumberField';

interface LoginOtpRequestStepProps {
  login: UseLoginFormReturn;
}

/** Step 1 of OTP login: collect the mobile number and dispatch the SMS code. */
export function LoginOtpRequestStep({ login }: LoginOtpRequestStepProps) {
  const { otpMobileForm, requestOtp, isRequestingOtp, switchToPasswordMode } = login;
  const { register, watch, formState } = otpMobileForm;
  const mobileValue = watch('mobile');

  return (
    <form onSubmit={requestOtp} className="space-y-4" noValidate>
      <MobileNumberField
        id="login-otp-mobile"
        registration={register('mobile')}
        currentValue={mobileValue}
        errorMessage={formState.errors.mobile?.message}
        disabled={isRequestingOtp}
      />

      <AuthSubmitButton isReady={formState.isValid} isLoading={isRequestingOtp} loadingLabel="در حال ارسال...">
        ارسال کد تایید
      </AuthSubmitButton>

      <button
        type="button"
        onClick={switchToPasswordMode}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-[11px] font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
      >
        <KeyRound className="size-3.5" aria-hidden="true" />
        <span>ورود با رمز عبور</span>
      </button>
    </form>
  );
}
