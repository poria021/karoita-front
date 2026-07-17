'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvForm } from '@/components/shared/KvForm';
import { AuthService } from '@/services/auth.service';
import { MOCK_OTP_CODE } from '@/services/mock/auth-mock-users';
import { toPersianDigits } from '@/utils/persianDigits';

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
    mode: 'onTouched',
  });

  const otpForm = useForm<SecurityOtpSchema>({
    resolver: zodResolver(securityOtpSchema),
    defaultValues: { otp: '' },
    mode: 'onTouched',
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
      setFeedback({
        type: 'error',
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
      setFeedback({
        type: 'info',
        message: `کد تایید شبیه‌ساز ارسال شد: ${toPersianDigits(MOCK_OTP_CODE)}`,
      });
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
      setFeedback({
        type: 'success',
        message: 'احراز هویت پیامکی موفقیت‌آمیز بود.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
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
      setFeedback({
        type: 'error',
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
    setFeedback({ type: 'info', message: 'عملیات لغو شد.' });
  };

  return (
    <KvCard dir="rtl" className="mx-auto max-w-xl">
      <KvCardContent className="space-y-kv-group pt-6">
        {!hasExistingPassword ? (
          <KvForm {...passwordForm}>
            <form
              onSubmit={saveFirstTimePassword}
              className="space-y-kv-group"
              noValidate
            >
              <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-[11px] font-bold text-brand-900">
                حساب شما فاقد رمز عبور است. لطفاً ابتدا رمز عبور خود را از کادر
                زیر تأیید و ثبت فرمایید:
              </div>
              <SecurityPasswordPairFields
                form={passwordForm}
                disabled={isDisabled}
              />
              <div className="flex justify-end border-t border-slate-200 pt-kv-group">
                <KvButton
                  type="submit"
                  color="cta"
                  appearance="solid"
                  disabled={isDisabled || !passwordForm.formState.isValid}
                  icon={
                    isBusy ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <KeyRound className="size-4" aria-hidden="true" />
                    )
                  }
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

        {feedback && (
          <p
            role="status"
            className={
              feedback.type === 'success'
                ? 'rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] font-bold text-emerald-700'
                : feedback.type === 'error'
                  ? 'rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] font-bold text-rose-700'
                  : 'rounded-xl border border-blue-200 bg-blue-50 p-3 text-[11px] font-bold text-blue-700'
            }
          >
            {feedback.message}
          </p>
        )}
      </KvCardContent>
    </KvCard>
  );
}
