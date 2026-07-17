'use client';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { OtpCodeField } from './fields/OtpCodeField';
import { OtpResendFooter } from './fields/OtpResendFooter';

interface ForgotVerifyStepProps {
  login: UseLoginFormReturn;
}

/** Step 2 of password recovery: verify the 5-digit SMS code. */
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
  const { register, formState } = forgotOtpForm;

  return (
    <form onSubmit={verifyForgotOtp} className="flex flex-col gap-kv-section" noValidate>
      <AuthStepHeading step={2} totalSteps={3} />

      <div className="flex flex-col gap-kv-group">
        <OtpCodeField
          id="forgot-otp-code"
          registration={register('otp')}
          errorMessage={formState.errors.otp?.message}
        />

        <OtpResendFooter
          secondsUntilResend={secondsUntilForgotResend}
          canResend={canResendForgotOtp}
          isResending={isResendingForgotOtp}
          onResend={resendForgotOtp}
          onGoBack={goBackToForgotStep1}
          goBackLabel="اصلاح شماره"
        />
      </div>

      <AuthSubmitButton isLoading={isVerifyingForgotOtp} loadingLabel="در حال تایید...">
        تایید و ادامه
      </AuthSubmitButton>
    </form>
  );
}
