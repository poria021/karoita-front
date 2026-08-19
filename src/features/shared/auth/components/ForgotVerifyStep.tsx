'use client';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthBusyForm } from './fields/AuthBusyForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { OtpCodeField } from './fields/OtpCodeField';
import { OtpResendFooter } from './fields/OtpResendFooter';

interface ForgotVerifyStepProps {
  login: UseLoginFormReturn;
}

export function ForgotVerifyStep({ login }: ForgotVerifyStepProps) {
  const {
    forgotOtpForm,
    verifyForgotOtp,
    isVerifyingForgotOtp,
    goBackToForgotStep1,
    resendForgotOtp,
    isResendingForgotOtp,
    secondsUntilForgotResend,
    canResendForgotOtp,
  } = login;
  const { register, formState, watch } = forgotOtpForm;

  return (
    <AuthBusyForm busy={isVerifyingForgotOtp} onSubmit={verifyForgotOtp}>
      <AuthStepHeading step={2} totalSteps={3} />

      <div className="flex flex-col gap-kv-group">
        <OtpCodeField
          id="forgot-otp-code"
          registration={register('otp')}
          value={watch('otp')}
          errorMessage={formState.errors.otp?.message}
          locked={isVerifyingForgotOtp || isResendingForgotOtp}
        />

        <OtpResendFooter
          secondsUntilResend={secondsUntilForgotResend}
          canResend={canResendForgotOtp}
          isResending={isResendingForgotOtp}
          isBusy={isVerifyingForgotOtp}
          onResend={resendForgotOtp}
          onGoBack={goBackToForgotStep1}
          goBackLabel="اصلاح شماره"
        />
      </div>

      <AuthSubmitButton isLoading={isVerifyingForgotOtp} loadingLabel="در حال تایید...">
        تایید و ادامه
      </AuthSubmitButton>
    </AuthBusyForm>
  );
}
