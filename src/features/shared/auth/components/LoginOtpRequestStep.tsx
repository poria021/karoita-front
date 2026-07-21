'use client';

import { KvButton } from '@/components/shared/KvButton';
import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthSubmitButton } from './fields/AuthSubmitButton';

interface LoginOtpRequestStepProps {
  login: UseLoginFormReturn;
}

export function LoginOtpRequestStep({ login }: LoginOtpRequestStepProps) {
  const { otpMobileForm, requestOtp, isRequestingOtp, switchToPasswordMode } = login;
  const { register, formState } = otpMobileForm;
  const mobileField = register('mobile');

  return (
    <form onSubmit={requestOtp} className="flex flex-col gap-kv-section" noValidate>
      <AuthStepHeading step={1} totalSteps={2} />

      <div className="flex flex-col gap-kv-group">
        <KvMobileNumberField
          id="login-otp-mobile"
          required
          error={formState.errors.mobile?.message}
          name={mobileField.name}
          onBlur={mobileField.onBlur}
          ref={mobileField.ref}
          onChange={mobileField.onChange}
        />
      </div>

      <div className="flex flex-col gap-kv-group">
        <AuthSubmitButton isLoading={isRequestingOtp} loadingLabel="در حال ارسال...">
          ارسال کد تایید
        </AuthSubmitButton>

        <KvButton
          type="button"
          appearance="secondary"
          fullWidth
          disabled={isRequestingOtp}
          onClick={switchToPasswordMode}
        >
          ورود با رمز عبور
        </KvButton>
      </div>
    </form>
  );
}
