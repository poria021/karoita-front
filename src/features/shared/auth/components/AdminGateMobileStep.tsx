'use client';

import { Controller } from 'react-hook-form';

import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';

import type { UseAdminGateReturn } from '../hooks/useAdminGate';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthBusyForm } from './fields/AuthBusyForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';

interface AdminGateMobileStepProps {
  gate: UseAdminGateReturn;
}

export function AdminGateMobileStep({ gate }: AdminGateMobileStepProps) {
  const { mobileForm, requestOtp, isRequestingOtp, secondsUntilResend } = gate;
  const { control, formState } = mobileForm;
  const hasActiveCountdown = secondsUntilResend > 0;

  return (
    <AuthBusyForm busy={isRequestingOtp} onSubmit={requestOtp}>
      <AuthStepHeading step={1} totalSteps={2} />

      <div className="flex flex-col gap-kv-group">
        <Controller
          name="mobile"
          control={control}
          render={({ field }) => (
            <KvMobileNumberField
              id="admin-gate-mobile"
              label="شماره موبایل مدیریت"
              required
              locked={isRequestingOtp}
              error={formState.errors.mobile?.message}
              name={field.name}
              value={field.value}
              autoComplete="off"
              onBlur={field.onBlur}
              ref={field.ref}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <AuthSubmitButton
        isLoading={isRequestingOtp}
        loadingLabel="در حال ارسال..."
        // مرحلهٔ OTP بعد از submit موفق نشان داده می‌شود (`requestOtp` مقدار `step=2` می‌گذارد).
      >
        {hasActiveCountdown ? 'ادامه (کد قبلاً ارسال شده)' : 'ارسال کد تایید'}
      </AuthSubmitButton>
    </AuthBusyForm>
  );
}
