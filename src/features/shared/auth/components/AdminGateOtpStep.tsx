'use client';

import type { UseAdminGateReturn } from '../hooks/useAdminGate';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { OtpCodeField } from './fields/OtpCodeField';
import { OtpResendFooter } from './fields/OtpResendFooter';

interface AdminGateOtpStepProps {
  gate: UseAdminGateReturn;
}

export function AdminGateOtpStep({ gate }: AdminGateOtpStepProps) {
  const {
    otpForm,
    verifyOtp,
    isVerifyingOtp,
    goBackToMobileStep,
    resendOtp,
    isResending,
    secondsUntilResend,
    canResend,
  } = gate;
  const { register, formState } = otpForm;

  return (
    <form onSubmit={verifyOtp} className="flex flex-col gap-kv-section" noValidate>
      <AuthStepHeading step={2} totalSteps={2} />

      <div className="flex flex-col gap-kv-group">
        <OtpCodeField
          id="admin-gate-otp"
          registration={register('otp')}
          errorMessage={formState.errors.otp?.message}
        />

        <OtpResendFooter
          secondsUntilResend={secondsUntilResend}
          canResend={canResend}
          isResending={isResending}
          isBusy={isVerifyingOtp}
          onResend={resendOtp}
          onGoBack={goBackToMobileStep}
          goBackLabel="اصلاح شماره"
        />
      </div>

      <AuthSubmitButton isLoading={isVerifyingOtp} loadingLabel="در حال تایید...">
        ورود به پنل مدیریت
      </AuthSubmitButton>
    </form>
  );
}
