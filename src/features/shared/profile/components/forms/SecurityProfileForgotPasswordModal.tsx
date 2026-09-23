'use client';

import { KvButton } from '@/components/shared/KvButton';
import { KvPasswordField } from '@/components/shared/fields/KvPasswordField';
import {
  KvDialog,
  KvDialogContent,
  KvDialogFooter,
} from '@/components/shared/KvDialog';
import { KvTypography } from '@/components/shared/KvTypography';
import { OtpCodeField } from '@/features/shared/auth/components/fields/OtpCodeField';
import { OtpResendFooter } from '@/features/shared/auth/components/fields/OtpResendFooter';

import type { UseProfileForgotPasswordReturn } from '../../hooks/useProfileForgotPassword';

interface SecurityProfileForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forgotPassword: UseProfileForgotPasswordReturn;
}

export function SecurityProfileForgotPasswordModal({
  open,
  onOpenChange,
  forgotPassword,
}: SecurityProfileForgotPasswordModalProps) {
  const {
    forgotStep,
    forgotOtpResetForm,
    submitResetPassword,
    isSubmittingResetPassword,
    sendForgotOtp,
    isSendingForgotOtp,
    goBackToForgotStep1,
    resendForgotOtp,
    isResendingForgotOtp,
    secondsUntilForgotResend,
    canResendForgotOtp,
  } = forgotPassword;

  const { register, formState, watch } = forgotOtpResetForm;
  const busy = isSubmittingResetPassword || isResendingForgotOtp;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      goBackToForgotStep1();
    }
    onOpenChange(newOpen);
  };

  return (
    <KvDialog open={open} onOpenChange={handleOpenChange}>
      <KvDialogContent dir="rtl">
        {forgotStep === 1 && (
          <div className="space-y-kv-group">
            <div className="space-y-kv-pair">
              <KvTypography variant="title">
                تغییر رمز عبور
              </KvTypography>
              <KvTypography variant="caption" tone="muted">
                کد تأیید برای تغییر رمز عبور شما از طریق پیامک ارسال خواهد شد.
              </KvTypography>
            </div>

            <div className="flex gap-kv-pair">
              <KvButton
                type="button"
                color="cta"
                appearance="solid"
                fullWidth
                loading={isSendingForgotOtp}
                onClick={sendForgotOtp}
              >
                ارسال کد تأیید
              </KvButton>
              <KvButton
                type="button"
                color="neutral"
                appearance="secondary"
                fullWidth
                disabled={isSendingForgotOtp}
                onClick={() => handleOpenChange(false)}
              >
                انصراف
              </KvButton>
            </div>
          </div>
        )}

        {forgotStep === 2 && (
          <form onSubmit={submitResetPassword} noValidate className="space-y-kv-group">
            <div className="space-y-kv-pair">
              <KvTypography variant="title">
                تغییر رمز عبور
              </KvTypography>
              <KvTypography variant="caption" tone="muted">
                کد تأیید ۵ رقمی را وارد کرده و رمز جدید خود را تعیین کنید.
              </KvTypography>
            </div>

            <div className="space-y-kv-group">
              <OtpCodeField
                id="profile-forgot-otp-code"
                registration={register('otp')}
                value={watch('otp')}
                errorMessage={formState.errors.otp?.message}
                locked={busy}
              />

              <KvPasswordField
                id="profile-forgot-new-password"
                label="رمز عبور جدید"
                required
                autoComplete="new-password"
                error={formState.errors.newPassword?.message}
                {...register('newPassword')}
                locked={busy}
              />

              <KvPasswordField
                id="profile-forgot-confirm-password"
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
                goBackLabel="بازگشت"
              />
            </div>

            <KvDialogFooter>
              <KvButton
                type="button"
                color="neutral"
                appearance="secondary"
                disabled={busy}
                onClick={() => handleOpenChange(false)}
              >
                انصراف
              </KvButton>
              <KvButton
                type="submit"
                color="cta"
                appearance="solid"
                loading={isSubmittingResetPassword}
                disabled={busy}
              >
                تأیید و تغییر رمز
              </KvButton>
            </KvDialogFooter>
          </form>
        )}
      </KvDialogContent>
    </KvDialog>
  );
}
