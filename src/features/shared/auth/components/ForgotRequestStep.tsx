'use client';

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
  const { register, formState } = forgotMobileForm;
  const mobileField = register('mobile');

  return (
    <form onSubmit={sendForgotOtp} className="flex flex-col gap-kv-section" noValidate>
      <AuthStepHeading step={1} totalSteps={3} />

      <div className="flex flex-col gap-kv-group">
        <KvMobileNumberField
          id="forgot-mobile"
          required
          error={formState.errors.mobile?.message}
          name={mobileField.name}
          onBlur={mobileField.onBlur}
          ref={mobileField.ref}
          onChange={mobileField.onChange}
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
