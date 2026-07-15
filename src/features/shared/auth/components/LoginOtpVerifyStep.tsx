'use client';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { OtpCodeField } from './fields/OtpCodeField';
import { OtpResendFooter } from './fields/OtpResendFooter';

interface LoginOtpVerifyStepProps {
  login: UseLoginFormReturn;
}

/** Step 2 of OTP login: verify the 5-digit SMS code (test code `12345` in mock mode). */
export function LoginOtpVerifyStep({ login }: LoginOtpVerifyStepProps) {
  const { otpCodeForm, verifyOtp, isVerifyingOtp, goBackToPhoneStep, resendOtp, isResendingOtp, secondsUntilResend, canResendOtp } = login;
  const { register, watch, formState } = otpCodeForm;
  const otpValue = watch('otp');

  return (
    <form onSubmit={verifyOtp} className="space-y-4" noValidate>
      <OtpCodeField id="login-otp-code" registration={register('otp')} currentValue={otpValue} errorMessage={formState.errors.otp?.message} />

      <OtpResendFooter
        secondsUntilResend={secondsUntilResend}
        canResend={canResendOtp}
        isResending={isResendingOtp}
        onResend={resendOtp}
        onGoBack={goBackToPhoneStep}
        goBackLabel="اصلاح شماره"
      />

      <AuthSubmitButton isReady={formState.isValid} isLoading={isVerifyingOtp} loadingLabel="در حال تایید...">
        تایید کد و ورود
      </AuthSubmitButton>
    </form>
  );
}
