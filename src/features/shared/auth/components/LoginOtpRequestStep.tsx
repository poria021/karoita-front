'use client';

import { KeyRound } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { MobileNumberField } from './fields/MobileNumberField';

interface LoginOtpRequestStepProps {
  login: UseLoginFormReturn;
}

/** Step 1 of OTP login: collect the mobile number and dispatch the SMS code. */
export function LoginOtpRequestStep({ login }: LoginOtpRequestStepProps) {
  const { otpMobileForm, requestOtp, isRequestingOtp, switchToPasswordMode } = login;
  const { register, formState } = otpMobileForm;

  return (
    <form onSubmit={requestOtp} className="space-y-kv-group" noValidate>
      <MobileNumberField
        id="login-otp-mobile"
        registration={register('mobile')}
        errorMessage={formState.errors.mobile?.message}
        disabled={isRequestingOtp}
      />

      <AuthSubmitButton isReady={formState.isValid} isLoading={isRequestingOtp} loadingLabel="در حال ارسال...">
        ارسال کد تایید
      </AuthSubmitButton>

      <Button
        type="button"
        variant="outline"
        onClick={switchToPasswordMode}
        className="h-auto w-full gap-1.5 rounded-xl border-slate-200 bg-slate-50 py-2.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      >
        <KeyRound className="size-3.5" aria-hidden="true" />
        <span>ورود با رمز عبور</span>
      </Button>
    </form>
  );
}
