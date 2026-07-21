'use client';

import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';

import type { UseAdminGateReturn } from '../hooks/useAdminGate';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthSubmitButton } from './fields/AuthSubmitButton';

interface AdminGateMobileStepProps {
  gate: UseAdminGateReturn;
}

export function AdminGateMobileStep({ gate }: AdminGateMobileStepProps) {
  const { mobileForm, requestOtp, isRequestingOtp, secondsUntilResend } = gate;
  const { register, formState } = mobileForm;
  const mobileField = register('mobile');
  const hasActiveCountdown = secondsUntilResend > 0;

  return (
    <form onSubmit={requestOtp} className="flex flex-col gap-kv-section" noValidate>
      <AuthStepHeading step={1} totalSteps={2} />

      <div className="flex flex-col gap-kv-group">
        <KvMobileNumberField
          id="admin-gate-mobile"
          label="شماره موبایل مدیریت"
          required
          error={formState.errors.mobile?.message}
          name={mobileField.name}
          autoComplete="off"
          onBlur={mobileField.onBlur}
          ref={mobileField.ref}
          onChange={mobileField.onChange}
        />
      </div>

      <AuthSubmitButton isLoading={isRequestingOtp} loadingLabel="در حال ارسال...">
        {hasActiveCountdown ? 'ادامه (کد قبلاً ارسال شده)' : 'ارسال کد تایید'}
      </AuthSubmitButton>
    </form>
  );
}
