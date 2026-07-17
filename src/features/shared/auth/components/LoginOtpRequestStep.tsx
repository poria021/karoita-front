'use client';

import { KeyRound } from 'lucide-react';

import { KvButton } from '@/components/shared/KvButton';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { MobileNumberField } from './fields/MobileNumberField';

interface LoginOtpRequestStepProps {
  login: UseLoginFormReturn;
}

/** Step 1 of OTP login: collect the mobile number and dispatch the SMS code. */
export function LoginOtpRequestStep({ login }: LoginOtpRequestStepProps) {
  const { otpMobileForm, requestOtp, isRequestingOtp, switchToPasswordMode } =
    login;
  const { register, formState } = otpMobileForm;

  return (
    <form onSubmit={requestOtp} className="space-y-kv-group" noValidate>
      <MobileNumberField
        id="login-otp-mobile"
        registration={register('mobile')}
        errorMessage={formState.errors.mobile?.message}
        disabled={isRequestingOtp}
      />

      <AuthSubmitButton
        isReady={formState.isValid}
        isLoading={isRequestingOtp}
        loadingLabel="در حال ارسال..."
      >
        ارسال کد تایید
      </AuthSubmitButton>

      <KvButton
        type="button"
        color="neutral"
        appearance="ghost"
        size="sm"
        fullWidth
        icon={<KeyRound className="size-3.5" aria-hidden="true" />}
        onClick={switchToPasswordMode}
      >
        ورود با رمز عبور
      </KvButton>
    </form>
  );
}
