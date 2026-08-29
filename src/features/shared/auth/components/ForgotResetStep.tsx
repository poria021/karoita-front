'use client';

import { KvButton } from '@/components/shared/KvButton';
import { KvPasswordField } from '@/components/shared/fields/KvPasswordField';

import type { UseForgotPasswordReturn } from '../hooks/useForgotPassword';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthBusyForm } from './fields/AuthBusyForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { OtpCodeField } from './fields/OtpCodeField';
import { OtpResendFooter } from './fields/OtpResendFooter';

interface ForgotResetStepProps {
  forgot: UseForgotPasswordReturn;
}

export function ForgotResetStep({ forgot }: ForgotResetStepProps) {
  const {
    forgotOtpResetForm,
    submitResetPassword,
    isSubmittingResetPassword,
    goBackToForgotStep1,
    resendForgotOtp,
    isResendingForgotOtp,
    secondsUntilForgotResend,
    canResendForgotOtp,
  } = forgot;
  const { register, formState, watch } = forgotOtpResetForm;
  const busy = isSubmittingResetPassword || isResendingForgotOtp;

  return (
    <AuthBusyForm busy={busy} onSubmit={submitResetPassword}>
      <AuthStepHeading step={2} totalSteps={2} />

      <div className="flex flex-col gap-kv-group">
        <OtpCodeField
          id="forgot-otp-code"
          registration={register('otp')}
          value={watch('otp')}
          errorMessage={formState.errors.otp?.message}
          locked={busy}
        />

        <KvPasswordField
          id="forgot-new-password"
          label="رمز عبور جدید"
          required
          autoComplete="new-password"
          error={formState.errors.newPassword?.message}
          {...register('newPassword')}
          locked={busy}
        />

        <KvPasswordField
          id="forgot-confirm-password"
          label="تکرار رمز عبور جدید"
          required
          autoComplete="new-password"
          error={formState.errors.confirmPassword?.message}
          {...register('confirmPassword')}
          locked={busy}
        />

        <OtpResendFooter
          secondsUntilResend={secondsUntilForgotResend}
          canResend={canResendForgotOtp}
          isResending={isResendingForgotOtp}
          isBusy={isSubmittingResetPassword}
          onResend={resendForgotOtp}
          onGoBack={goBackToForgotStep1}
          goBackLabel="اصلاح شماره"
        />
      </div>

      <div className="flex flex-col gap-kv-group">
        <AuthSubmitButton
          isLoading={isSubmittingResetPassword}
          loadingLabel="در حال ثبت..."
        >
          تایید و تغییر رمز
        </AuthSubmitButton>

        <KvButton
          type="button"
          appearance="secondary"
          fullWidth
          onClick={goBackToForgotStep1}
          disabled={busy}
        >
          بازگشت به مرحله قبل
        </KvButton>
      </div>
    </AuthBusyForm>
  );
}
