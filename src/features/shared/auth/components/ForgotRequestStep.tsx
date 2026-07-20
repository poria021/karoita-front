'use client';

import { KvButton } from '@/components/shared/KvButton';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { MobileNumberField } from './fields/MobileNumberField';

interface ForgotRequestStepProps {
  login: UseLoginFormReturn;
}

export function ForgotRequestStep({ login }: ForgotRequestStepProps) {
  const { forgotMobileForm, sendForgotOtp, isSendingForgotOtp, cancelForgotMode } = login;
  const { register, formState } = forgotMobileForm;

  return (
    <form onSubmit={sendForgotOtp} className="flex flex-col gap-kv-section" noValidate>
      <AuthStepHeading step={1} totalSteps={3} />

      <div className="flex flex-col gap-kv-group">
        <MobileNumberField
          id="forgot-mobile"
          registration={register('mobile')}
          errorMessage={formState.errors.mobile?.message}
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
