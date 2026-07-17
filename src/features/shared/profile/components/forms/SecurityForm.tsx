'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvForm } from '@/components/shared/KvForm';
import { AuthService } from '@/services/auth.service';
import { faIcons } from '@/utils/iconMap';

import {
  securityOtpSchema,
  securityPasswordSchema,
  type SecurityOtpSchema,
  type SecurityPasswordSchema,
} from '../../schemas/security.schema';
import { SecurityChangePasswordFlow } from './SecurityChangePasswordFlow';
import { SecurityPasswordPairFields } from './SecurityPasswordPairFields';

type PasswordStep = 'initial' | 'otp_pending' | 'new_password_pending';

export interface SecurityFormProps {
  mobile: string;
  hasPassword?: boolean;
  disabled?: boolean;
  onPasswordRegistered?: () => void;
}

/** Profile security tab: first-time password + OTP change-password workflow. */
export function SecurityForm({
  mobile,
  hasPassword = true,
  disabled = false,
  onPasswordRegistered,
}: SecurityFormProps) {
  const [hasExistingPassword, setHasExistingPassword] = useState(hasPassword);
  const [passwordStep, setPasswordStep] = useState<PasswordStep>('initial');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setHasExistingPassword(hasPassword);
  }, [hasPassword]);

  const passwordForm = useForm<SecurityPasswordSchema>({
    resolver: zodResolver(securityPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const otpForm = useForm<SecurityOtpSchema>({
    resolver: zodResolver(securityOtpSchema),
    defaultValues: { otp: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const isDisabled = disabled || isBusy;

  const resetPasswordFields = () => {
    passwordForm.reset({ newPassword: '', confirmPassword: '' });
  };

  const saveFirstTimePassword = passwordForm.handleSubmit(async (data) => {
    setFeedback(null);
    setIsBusy(true);
    try {
      await AuthService.setInitialPassword(mobile, data.newPassword);
      setHasExistingPassword(true);
      setPasswordStep('initial');
      resetPasswordFields();
      setFeedback({ type: 'success', message: 'رمز عبور اولیه شما ثبت شد.' });
      onPasswordRegistered?.();
    } catch (error) {
      passwordForm.setError('newPassword', {
        message:
          error instanceof Error
            ? error.message
            : 'ثبت رمز عبور اولیه با خطا مواجه شد.',
      });
    } finally {
      setIsBusy(false);
    }
  });

  const requestPasswordChangeOtp = async () => {
    setFeedback(null);
    setIsBusy(true);
    try {
      await AuthService.sendForgotPasswordOtp(mobile);
      otpForm.reset({ otp: '' });
      setPasswordStep('otp_pending');
      // Inline step banner already shows OTP status — avoid duplicate bottom alert.
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'ارسال کد تایید ناموفق بود.',
      });
    } finally {
      setIsBusy(false);
    }
  };

  const verifyPasswordOtp = otpForm.handleSubmit(async (data) => {
    setFeedback(null);
    setIsBusy(true);
    try {
      await AuthService.verifyForgotPasswordOtp(mobile, data.otp);
      setPasswordStep('new_password_pending');
      resetPasswordFields();
      // Inline step banner already confirms OTP success — avoid duplicate bottom alert.
    } catch (error) {
      otpForm.setError('otp', {
        message:
          error instanceof Error ? error.message : 'کد تایید معتبر نیست.',
      });
    } finally {
      setIsBusy(false);
    }
  });

  const saveNewPasswordWithOtp = passwordForm.handleSubmit(async (data) => {
    setFeedback(null);
    setIsBusy(true);
    try {
      await AuthService.resetPassword(
        mobile,
        otpForm.getValues('otp'),
        data.newPassword
      );
      setPasswordStep('initial');
      resetPasswordFields();
      otpForm.reset({ otp: '' });
      setFeedback({
        type: 'success',
        message: 'رمز عبور با موفقیت به‌روزرسانی شد.',
      });
    } catch (error) {
      passwordForm.setError('newPassword', {
        message:
          error instanceof Error
            ? error.message
            : 'به‌روزرسانی رمز عبور با خطا مواجه شد.',
      });
    } finally {
      setIsBusy(false);
    }
  });

  const cancelPasswordChangeProcess = () => {
    setPasswordStep('initial');
    resetPasswordFields();
    otpForm.reset({ otp: '' });
    setFeedback(null);
  };

  return (
    <KvCard
      dir="rtl"
      className="mx-auto w-full max-w-4xl gap-0 rounded-kv-panel border-kv-border py-0 shadow-kv-raised"
    >
      <KvCardContent className="space-y-5 p-5 sm:p-6">
        {!hasExistingPassword ? (
          <KvForm {...passwordForm}>
            <form
              onSubmit={saveFirstTimePassword}
              className="space-y-kv-group"
              noValidate
            >
              <KvAlert
                variant="info"
                title="برای حساب شما هنوز رمز عبور ثبت نشده است"
                description="رمز عبور جدید را در کادرهای زیر وارد و ثبت کنید."
              />
              <SecurityPasswordPairFields
                form={passwordForm}
                disabled={isDisabled}
              />
              <div className="flex justify-end border-t border-kv-border pt-kv-group">
                <KvButton
                  type="submit"
                  color="cta"
                  appearance="solid"
                  loading={isBusy}
                  disabled={disabled}
                  icon={<FaIcon icon={faIcons.key} size="sm" />}
                >
                  تأیید و ثبت رمز عبور اولیه
                </KvButton>
              </div>
            </form>
          </KvForm>
        ) : (
          <SecurityChangePasswordFlow
            passwordStep={passwordStep}
            passwordForm={passwordForm}
            otpForm={otpForm}
            isBusy={isBusy}
            isDisabled={isDisabled}
            onRequestOtp={requestPasswordChangeOtp}
            onVerifyOtp={verifyPasswordOtp}
            onSaveNewPassword={saveNewPasswordWithOtp}
            onCancel={cancelPasswordChangeProcess}
          />
        )}

        {feedback ? (
          <KvAlert variant={feedback.type} title={feedback.message} />
        ) : null}
      </KvCardContent>
    </KvCard>
  );
}
