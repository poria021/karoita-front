'use client';

import type { UseRegisterFormReturn } from '../hooks/useRegisterForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { OtpCodeField } from './fields/OtpCodeField';
import { OtpResendFooter } from './fields/OtpResendFooter';

interface RegisterOtpStepProps {
  registerForm: UseRegisterFormReturn;
}

/** Step 2 of registration: verify the 5-digit SMS code (test code `12345` in mock mode). */
export function RegisterOtpStep({ registerForm }: RegisterOtpStepProps) {
  const { otpForm, verifyOtp, isVerifyingOtp, goBackToStep1, resendOtp, isResendingOtp, secondsUntilResend, canResendOtp } = registerForm;
  const { register, formState } = otpForm;

  return (
    <form onSubmit={verifyOtp} className="space-y-kv-group" noValidate>
      <OtpCodeField
        id="register-otp-code"
        registration={register('otp')}
        errorMessage={formState.errors.otp?.message}
      />

      <OtpResendFooter
        secondsUntilResend={secondsUntilResend}
        canResend={canResendOtp}
        isResending={isResendingOtp}
        onResend={resendOtp}
        onGoBack={goBackToStep1}
        goBackLabel="اصلاح شماره و نقش"
      />

      <AuthSubmitButton isReady={formState.isValid} isLoading={isVerifyingOtp} loadingLabel="در حال ثبت‌نام...">
        تایید کد و ثبت نام
      </AuthSubmitButton>
    </form>
  );
}
