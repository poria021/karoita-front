'use client';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { OtpCodeField } from './fields/OtpCodeField';
import { OtpResendFooter } from './fields/OtpResendFooter';

interface ForgotVerifyStepProps {
  login: UseLoginFormReturn;
}

/** Step 2 of password recovery: verify the 5-digit SMS code (test code `12345` in mock mode). */
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
  const { register, watch, formState } = forgotOtpForm;
  const otpValue = watch('otp');

  return (
    <form onSubmit={verifyForgotOtp} className="space-y-4" noValidate>
      <OtpCodeField
        id="forgot-otp-code"
        registration={register('otp')}
        currentValue={otpValue}
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
        <button
          type="button"
          onClick={cancelForgotMode}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-black text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
          انصراف
        </button>
        <div className="flex-1">
          <AuthSubmitButton isReady={formState.isValid} isLoading={isVerifyingForgotOtp} loadingLabel="در حال تایید...">
            تایید و ادامه
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  );
}
