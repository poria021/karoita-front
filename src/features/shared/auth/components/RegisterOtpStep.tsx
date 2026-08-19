'use client';

import type { UseRegisterFormReturn } from '../hooks/useRegisterForm';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthBusyForm } from './fields/AuthBusyForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { OtpCodeField } from './fields/OtpCodeField';
import { OtpResendFooter } from './fields/OtpResendFooter';

interface RegisterOtpStepProps {
  registerForm: UseRegisterFormReturn;
}

export function RegisterOtpStep({ registerForm }: RegisterOtpStepProps) {
  const {
    otpForm,
    verifyOtp,
    isVerifyingOtp,
    goBackToStep1,
    resendOtp,
    isResendingOtp,
    secondsUntilResend,
    canResendOtp,
  } = registerForm;
  const { register, formState, watch } = otpForm;
  const busy = isVerifyingOtp || isResendingOtp;

  return (
    <AuthBusyForm busy={busy} onSubmit={verifyOtp}>
      <AuthStepHeading step={2} totalSteps={2} />

      <div className="flex flex-col gap-kv-group">
        <OtpCodeField
          id="register-otp-code"
          registration={register('otp')}
          value={watch('otp')}
          errorMessage={formState.errors.otp?.message}
          locked={busy}
        />

        <OtpResendFooter
          secondsUntilResend={secondsUntilResend}
          canResend={canResendOtp}
          isResending={isResendingOtp}
          isBusy={isVerifyingOtp}
          onResend={resendOtp}
          onGoBack={goBackToStep1}
          goBackLabel="اصلاح شماره و نقش"
        />
      </div>

      <AuthSubmitButton isLoading={isVerifyingOtp} loadingLabel="در حال ثبت‌نام...">
        تایید کد و ثبت نام
      </AuthSubmitButton>
    </AuthBusyForm>
  );
}
