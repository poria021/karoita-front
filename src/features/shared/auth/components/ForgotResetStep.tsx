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

  const newPasswordField = register('newPassword');
  const confirmPasswordField = register('confirmPassword');

  const newPasswordProps = {
    name: newPasswordField.name,
    onBlur: newPasswordField.onBlur,
    onChange: newPasswordField.onChange,
    ref: newPasswordField.ref,
  } as const;

  const confirmPasswordProps = {
    name: confirmPasswordField.name,
    onBlur: confirmPasswordField.onBlur,
    onChange: confirmPasswordField.onChange,
    ref: confirmPasswordField.ref,
  } as const;

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
          {...newPasswordProps}
        />

        <KvPasswordField
          id="forgot-confirm-password"
          label="تکرار رمز عبور جدید"
          required
          autoComplete="new-password"
          error={formState.errors.confirmPassword?.message}
          {...confirmPasswordProps}
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