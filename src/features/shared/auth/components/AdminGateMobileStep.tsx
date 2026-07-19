'use client';

import type { UseAdminGateReturn } from '../hooks/useAdminGate';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { MobileNumberField } from './fields/MobileNumberField';

interface AdminGateMobileStepProps {
  gate: UseAdminGateReturn;
}

/** Admin gate step 1 — management mobile only. */
export function AdminGateMobileStep({ gate }: AdminGateMobileStepProps) {
  const { mobileForm, requestOtp, isRequestingOtp, secondsUntilResend } = gate;
  const { register, formState } = mobileForm;
  const hasActiveCountdown = secondsUntilResend > 0;

  return (
    <form onSubmit={requestOtp} className="flex flex-col gap-kv-section" noValidate>
      <AuthStepHeading step={1} totalSteps={2} />

      <div className="flex flex-col gap-kv-group">
        <MobileNumberField
          id="admin-gate-mobile"
          label="شماره موبایل مدیریت"
          registration={register('mobile')}
          errorMessage={formState.errors.mobile?.message}
          autoComplete="off"
        />
      </div>

      <AuthSubmitButton isLoading={isRequestingOtp} loadingLabel="در حال ارسال...">
        {hasActiveCountdown ? 'ادامه (کد قبلاً ارسال شده)' : 'ارسال کد تایید'}
      </AuthSubmitButton>
    </form>
  );
}
