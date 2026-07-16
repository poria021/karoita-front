'use client';

import { ArrowRightToLine } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { MobileNumberField } from './fields/MobileNumberField';

interface ForgotRequestStepProps {
  login: UseLoginFormReturn;
}

/** Step 1 of password recovery: collect the mobile number and dispatch the SMS code. */
export function ForgotRequestStep({ login }: ForgotRequestStepProps) {
  const { forgotMobileForm, sendForgotOtp, isSendingForgotOtp, cancelForgotMode } = login;
  const { register, watch, formState } = forgotMobileForm;
  const mobileValue = watch('mobile');

  return (
    <form onSubmit={sendForgotOtp} className="space-y-4" noValidate>
      <MobileNumberField
        id="forgot-mobile"
        registration={register('mobile')}
        currentValue={mobileValue}
        errorMessage={formState.errors.mobile?.message}
        disabled={isSendingForgotOtp}
      />

      <AuthSubmitButton isReady={formState.isValid} isLoading={isSendingForgotOtp} loadingLabel="در حال ارسال...">
        ارسال کد بازیابی
      </AuthSubmitButton>

      <Button
        type="button"
        variant="outline"
        onClick={cancelForgotMode}
        className="h-auto w-full gap-1.5 rounded-xl border-slate-200 bg-slate-50 py-2.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      >
        <ArrowRightToLine className="size-3.5" aria-hidden="true" />
        <span>انصراف و بازگشت به ورود</span>
      </Button>
    </form>
  );
}
