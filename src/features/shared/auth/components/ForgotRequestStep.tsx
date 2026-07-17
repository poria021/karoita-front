'use client';

import { ArrowRightToLine } from 'lucide-react';

import { KvButton } from '@/components/shared/KvButton';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { MobileNumberField } from './fields/MobileNumberField';

interface ForgotRequestStepProps {
  login: UseLoginFormReturn;
}

/** Step 1 of password recovery: collect the mobile number and dispatch the SMS code. */
export function ForgotRequestStep({ login }: ForgotRequestStepProps) {
  const {
    forgotMobileForm,
    sendForgotOtp,
    isSendingForgotOtp,
    cancelForgotMode,
  } = login;
  const { register, formState } = forgotMobileForm;

  return (
    <form onSubmit={sendForgotOtp} className="space-y-kv-group" noValidate>
      <MobileNumberField
        id="forgot-mobile"
        registration={register('mobile')}
        errorMessage={formState.errors.mobile?.message}
        disabled={isSendingForgotOtp}
      />

      <AuthSubmitButton
        isReady={formState.isValid}
        isLoading={isSendingForgotOtp}
        loadingLabel="در حال ارسال..."
      >
        ارسال کد بازیابی
      </AuthSubmitButton>

      <KvButton
        type="button"
        color="neutral"
        appearance="ghost"
        size="sm"
        fullWidth
        icon={<ArrowRightToLine className="size-3.5" aria-hidden="true" />}
        onClick={cancelForgotMode}
      >
        انصراف و بازگشت به ورود
      </KvButton>
    </form>
  );
}
