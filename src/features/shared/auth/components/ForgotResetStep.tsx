'use client';

import { KeyRound } from 'lucide-react';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { PasswordField } from './fields/PasswordField';

interface ForgotResetStepProps {
  login: UseLoginFormReturn;
}

/** Step 3 of password recovery: choose and confirm a brand-new password. */
export function ForgotResetStep({ login }: ForgotResetStepProps) {
  const { forgotResetForm, submitResetPassword, isSubmittingResetPassword } = login;
  const { register, watch, formState } = forgotResetForm;
  const newPasswordValue = watch('newPassword');
  const confirmPasswordValue = watch('confirmPassword');

  return (
    <form onSubmit={submitResetPassword} className="space-y-4" noValidate>
      <PasswordField
        id="forgot-new-password"
        label="رمز عبور جدید"
        registration={register('newPassword')}
        currentValue={newPasswordValue}
        errorMessage={formState.errors.newPassword?.message}
      />

      <PasswordField
        id="forgot-confirm-password"
        label="تکرار رمز عبور جدید"
        registration={register('confirmPassword')}
        currentValue={confirmPasswordValue}
        errorMessage={formState.errors.confirmPassword?.message}
      />

      <AuthSubmitButton
        isReady={formState.isValid}
        isLoading={isSubmittingResetPassword}
        loadingLabel="در حال ثبت..."
        icon={<KeyRound className="size-4" aria-hidden="true" />}
      >
        تایید نهایی و تغییر رمز
      </AuthSubmitButton>
    </form>
  );
}
