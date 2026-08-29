'use client';

import Link from 'next/link';
import { Controller } from 'react-hook-form';

import { KvButton } from '@/components/shared/KvButton';
import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';

import type { UseForgotPasswordReturn } from '../hooks/useForgotPassword';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthBusyForm } from './fields/AuthBusyForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';

interface ForgotRequestStepProps {
  forgot: UseForgotPasswordReturn;
  cancelHref: string;
}

export function ForgotRequestStep({
  forgot,
  cancelHref,
}: ForgotRequestStepProps) {
  const { forgotMobileForm, sendForgotOtp, isSendingForgotOtp } = forgot;
  const { control, formState } = forgotMobileForm;

  return (
    <AuthBusyForm busy={isSendingForgotOtp} onSubmit={sendForgotOtp}>
      <AuthStepHeading step={1} totalSteps={2} />

      <div className="flex flex-col gap-kv-group">
        <Controller
          name="mobile"
          control={control}
          render={({ field }) => (
            <KvMobileNumberField
              id="forgot-mobile"
              required
              locked={isSendingForgotOtp}
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

        <KvButton asChild appearance="secondary" fullWidth>
          <Link href={cancelHref} prefetch={false} replace>
            بازگشت به ورود
          </Link>
        </KvButton>
      </div>
    </AuthBusyForm>
  );
}
