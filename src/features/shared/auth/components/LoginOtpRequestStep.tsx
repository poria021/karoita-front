'use client';

import { KvButton } from '@/components/shared/KvButton';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthStepHeading } from './AuthStepHeading';
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
    <form onSubmit={requestOtp} className="flex flex-col gap-kv-section" noValidate>
      <AuthStepHeading step={1} totalSteps={2} />

      <div className="flex flex-col gap-kv-group">
        <MobileNumberField
          id="login-otp-mobile"
          registration={register('mobile')}
          errorMessage={formState.errors.mobile?.message}
          disabled={isRequestingOtp}
        />
      </div>

      <div className="flex flex-col gap-kv-group">
        <AuthSubmitButton isLoading={isRequestingOtp} loadingLabel="در حال ارسال...">
          ارسال کد تایید
        </AuthSubmitButton>

        <KvButton type="button" appearance="secondary" fullWidth onClick={switchToPasswordMode}>
          ورود با رمز عبور
        </KvButton>
      </div>
    </form>
  );
}
