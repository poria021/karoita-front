'use client';

import { KvButton } from '@/components/shared/KvButton';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { PasswordField } from './fields/PasswordField';

interface ForgotResetStepProps {
  login: UseLoginFormReturn;
}

export function ForgotResetStep({ login }: ForgotResetStepProps) {
  const { forgotResetForm, submitResetPassword, isSubmittingResetPassword, goBackToForgotStep2 } =
    login;
  const { register, formState } = forgotResetForm;

  return (
    <form onSubmit={submitResetPassword} className="flex flex-col gap-kv-section" noValidate>
      <AuthStepHeading step={3} totalSteps={3} />

      <div className="flex flex-col gap-kv-group">
        <PasswordField
          id="forgot-new-password"
          label="رمز عبور جدید"
          registration={register('newPassword')}
          errorMessage={formState.errors.newPassword?.message}
          autoComplete="new-password"
        />

        <PasswordField
          id="forgot-confirm-password"
          label="تکرار رمز عبور جدید"
          registration={register('confirmPassword')}
          errorMessage={formState.errors.confirmPassword?.message}
          autoComplete="new-password"
        />
      </div>

      <div className="flex flex-col gap-kv-group">
        <AuthSubmitButton isLoading={isSubmittingResetPassword} loadingLabel="در حال ثبت...">
          تایید نهایی و تغییر رمز
        </AuthSubmitButton>

        <KvButton type="button" appearance="secondary" fullWidth onClick={goBackToForgotStep2}>
          بازگشت به مرحله قبل
        </KvButton>
      </div>
    </form>
  );
}
