'use client';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { OtpCodeField } from './fields/OtpCodeField';
import { OtpResendFooter } from './fields/OtpResendFooter';

interface LoginOtpVerifyStepProps {
  login: UseLoginFormReturn;
}

/** Step 2 of OTP login: verify OTP (mock simulator accepts a fixed code — not Nest). */
export function LoginOtpVerifyStep({ login }: LoginOtpVerifyStepProps) {
  const {
    otpCodeForm,
    verifyOtp,
    isVerifyingOtp,
    goBackToPhoneStep,
    resendOtp,
    isResendingOtp,
    secondsUntilResend,
    canResendOtp,
  } = login;
  const { register, formState } = otpCodeForm;

  return (
    <form onSubmit={verifyOtp} className="flex flex-col gap-kv-section" noValidate>
      <AuthStepHeading step={2} totalSteps={2} />

      <div className="flex flex-col gap-kv-group">
        <OtpCodeField
          id="login-otp-code"
          registration={register('otp')}
          errorMessage={formState.errors.otp?.message}
        />

        <OtpResendFooter
          secondsUntilResend={secondsUntilResend}
          canResend={canResendOtp}
          isResending={isResendingOtp}
          isBusy={isVerifyingOtp}
          onResend={resendOtp}
          onGoBack={goBackToPhoneStep}
          goBackLabel="اصلاح شماره"
        />
      </div>

      <AuthSubmitButton isLoading={isVerifyingOtp} loadingLabel="در حال تایید...">
        تایید کد و ورود
      </AuthSubmitButton>
    </form>
  );
}
