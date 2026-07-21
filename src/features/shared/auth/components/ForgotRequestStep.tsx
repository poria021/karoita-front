'use client';

import { Controller } from 'react-hook-form';

import { KvButton } from '@/components/shared/KvButton';
import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthSubmitButton } from './fields/AuthSubmitButton';

interface ForgotRequestStepProps {
  login: UseLoginFormReturn;
}

export function ForgotRequestStep({ login }: ForgotRequestStepProps) {
  const { forgotMobileForm, sendForgotOtp, isSendingForgotOtp, cancelForgotMode } = login;
  const { control, formState } = forgotMobileForm;

  return (
    <form onSubmit={sendForgotOtp} className="flex flex-col gap-kv-section" noValidate>
      <AuthStepHeading step={1} totalSteps={3} />

      <div className="flex flex-col gap-kv-group">
        <Controller
          name="mobile"
          control={control}
          render={({ field }) => (
            <KvMobileNumberField
              id="forgot-mobile"
              required
              error={formState.errors.mobile?.message}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              ref={field.ref}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-kv-group">
        <AuthSubmitButton isLoading={isSendingForgotOtp} loadingLabel="در حال ارسال...">
          ارسال کد بازیابی
        </AuthSubmitButton>

        <KvButton type="button" appearance="secondary" fullWidth onClick={cancelForgotMode}>
          بازگشت به ورود
        </KvButton>
      </div>
    </form>
  );
}
