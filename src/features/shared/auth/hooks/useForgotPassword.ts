import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { AuthService } from '@/services/auth.service';

import {
  forgotOtpResetSchema,
  mobileSchema,
  type ForgotOtpResetSchema,
  type MobileSchema,
} from '../schemas/auth.schema';
import { isOtpAuthError, readAuthErrorMessage } from './authError';
import { useOtpCountdown } from './useOtpCountdown';

export type ForgotStep = 1 | 2;

interface UseForgotPasswordOptions {
  onComplete: (recoveredMobile: string) => void;
}

export function useForgotPassword({ onComplete }: UseForgotPasswordOptions) {
  const [forgotStep, setForgotStep] = useState<ForgotStep>(1);
  const [pendingForgotMobile, setPendingForgotMobile] = useState('');
  const [isResendingForgotOtp, setIsResendingForgotOtp] = useState(false);
  const countdown = useOtpCountdown();

  const forgotMobileForm = useForm<MobileSchema>({
    resolver: zodResolver(mobileSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { mobile: '' },
  });

  const forgotOtpResetForm = useForm<ForgotOtpResetSchema>({
    resolver: zodResolver(forgotOtpResetSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
  });

  const start = useCallback(
    (prefillMobile: string) => {
      forgotMobileForm.reset({ mobile: prefillMobile });
      forgotOtpResetForm.reset({ otp: '', newPassword: '', confirmPassword: '' });
      setForgotStep(1);
    },
    [forgotMobileForm, forgotOtpResetForm]
  );

  const goBackToForgotStep1 = useCallback(() => {
    setForgotStep(1);
    forgotOtpResetForm.reset({ otp: '', newPassword: '', confirmPassword: '' });
  }, [forgotOtpResetForm]);

  const sendForgotOtp = forgotMobileForm.handleSubmit(async (data) => {
    try {
      const isSameNumber = data.mobile === pendingForgotMobile && !countdown.canResend;

      if (!isSameNumber) {
        const { retryAfterSeconds } = await AuthService.sendForgotPasswordOtp(
          data.mobile
        );
        setPendingForgotMobile(data.mobile);
        countdown.restart(retryAfterSeconds);
      }

      setForgotStep(2);
      forgotOtpResetForm.reset({ otp: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      forgotMobileForm.setError('mobile', {
        message: readAuthErrorMessage(error),
      });
    }
  });

  const resendForgotOtp = useCallback(async () => {
    if (!countdown.canResend || isResendingForgotOtp) return;

    setIsResendingForgotOtp(true);
    try {
      const { retryAfterSeconds } = await AuthService.sendForgotPasswordOtp(
        pendingForgotMobile
      );
      countdown.restart(retryAfterSeconds);
      forgotOtpResetForm.setValue('otp', '', {
        shouldDirty: false,
        shouldValidate: false,
      });
    } catch (error) {
      forgotOtpResetForm.setError('otp', {
        message: readAuthErrorMessage(error),
      });
    } finally {
      setIsResendingForgotOtp(false);
    }
  }, [countdown, isResendingForgotOtp, pendingForgotMobile, forgotOtpResetForm]);

  const submitResetPassword = forgotOtpResetForm.handleSubmit(async (data) => {
    try {
      await AuthService.resetPassword(
        pendingForgotMobile,
        data.otp,
        data.newPassword
      );
      toast.success('رمز عبور با موفقیت تغییر کرد.');
      onComplete(pendingForgotMobile);
    } catch (error) {
      const message = readAuthErrorMessage(error);
      if (isOtpAuthError(error)) {
        forgotOtpResetForm.setError('otp', { message }, { shouldFocus: true });
        forgotOtpResetForm.clearErrors(['newPassword', 'confirmPassword']);
        return;
      }
      forgotOtpResetForm.setError('newPassword', { message }, { shouldFocus: true });
    }
  });

  return {
    start,
    goBackToForgotStep1,
    forgotStep,
    pendingForgotMobile,
    forgotMobileForm,
    sendForgotOtp,
    isSendingForgotOtp: forgotMobileForm.formState.isSubmitting,
    forgotOtpResetForm,
    submitResetPassword,
    isSubmittingResetPassword: forgotOtpResetForm.formState.isSubmitting,
    resendForgotOtp,
    isResendingForgotOtp,
    secondsUntilForgotResend: countdown.secondsLeft,
    canResendForgotOtp: countdown.canResend,
  };
}

export type UseForgotPasswordReturn = ReturnType<typeof useForgotPassword>;
