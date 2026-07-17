'use client';

import { KvButton } from '@/components/shared/KvButton';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
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
    cancelForgotMode,
  } = login;
  const { register, formState } = forgotOtpForm;

  return (
    <form onSubmit={verifyForgotOtp} className="space-y-kv-group" noValidate>
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

      <div className="flex items-center gap-2">
        <KvButton
          type="button"
          color="neutral"
          appearance="ghost"
          size="lg"
          className="flex-1"
          onClick={cancelForgotMode}
        >
          انصراف
        </KvButton>
        <div className="flex-1">
          <AuthSubmitButton
            isReady={formState.isValid}
            isLoading={isVerifyingForgotOtp}
            loadingLabel="در حال تایید..."
          >
            تایید و ادامه
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  );
}
