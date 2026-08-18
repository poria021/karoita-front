'use client';

import { KvButton } from '@/components/shared/KvButton';
import { KvPasswordField } from '@/components/shared/fields/KvPasswordField';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthSubmitButton } from './fields/AuthSubmitButton';

interface ForgotResetStepProps {
  login: UseLoginFormReturn;
}

export function ForgotResetStep({ login }: ForgotResetStepProps) {
  const {
    forgotResetForm,
    submitResetPassword,
    isSubmittingResetPassword,
    goBackToForgotStep2,
  } = login;
  const { register, formState } = forgotResetForm;

  return (
    <form
      onSubmit={submitResetPassword}
      className="flex flex-col gap-kv-section"
      noValidate
    >
      <AuthStepHeading step={3} totalSteps={3} />

      <div className="flex flex-col gap-kv-group">
        <KvPasswordField
          id="forgot-new-password"
          label="رمز عبور جدید"
          required
          autoComplete="new-password"
          error={formState.errors.newPassword?.message}
          {...register('newPassword')}
        />

        <KvPasswordField
          id="forgot-confirm-password"
          label="تکرار رمز عبور جدید"
          required
          autoComplete="new-password"
          error={formState.errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>

      <div className="flex flex-col gap-kv-group">
        <AuthSubmitButton
          isLoading={isSubmittingResetPassword}
          loadingLabel="در حال ثبت..."
        >
          تایید نهایی و تغییر رمز
        </AuthSubmitButton>

        <KvButton
          type="button"
          appearance="secondary"
          fullWidth
          onClick={goBackToForgotStep2}
        >
          بازگشت به مرحله قبل
        </KvButton>
      </div>
    </form>
  );
}