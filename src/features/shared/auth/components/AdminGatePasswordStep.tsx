'use client';

import { Controller } from 'react-hook-form';

import { KvButton } from '@/components/shared/KvButton';
import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';
import { KvPasswordField } from '@/components/shared/fields/KvPasswordField';

import type { UseAdminGateReturn } from '../hooks/useAdminGate';
import { AuthBusyForm } from './fields/AuthBusyForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';

interface AdminGatePasswordStepProps {
  gate: UseAdminGateReturn;
}

export function AdminGatePasswordStep({ gate }: AdminGatePasswordStepProps) {
  const { passwordForm, submitPassword, isSubmittingPassword, switchToOtpMode } =
    gate;
  const { control, formState } = passwordForm;

  return (
    <AuthBusyForm
      busy={isSubmittingPassword}
      onSubmit={submitPassword}
      autoComplete="off"
    >
      <div className="flex flex-col gap-kv-group">
        <Controller
          name="mobile"
          control={control}
          render={({ field }) => (
            <KvMobileNumberField
              id="admin-gate-password-mobile"
              label="شماره موبایل مدیریت"
              required
              locked={isSubmittingPassword}
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

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <KvPasswordField
              id="admin-gate-password"
              label="رمز عبور"
              required
              locked={isSubmittingPassword}
              suppressBrowserAutofill
              error={formState.errors.password?.message}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              ref={field.ref}
              onChange={(event) => field.onChange(event.target.value)}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-kv-group">
        <AuthSubmitButton
          isLoading={isSubmittingPassword}
          loadingLabel="در حال ورود..."
        >
          ورود به پنل مدیریت
        </AuthSubmitButton>

        <KvButton
          type="button"
          appearance="secondary"
          fullWidth
          disabled={isSubmittingPassword}
          onClick={switchToOtpMode}
        >
          ورود با رمز یکبار مصرف (OTP)
        </KvButton>
      </div>
    </AuthBusyForm>
  );
}
