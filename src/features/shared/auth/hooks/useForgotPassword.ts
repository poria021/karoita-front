import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthService } from '@/services/auth.service';

import {
  forgotResetSchema,
  mobileSchema,
  otpSchema,
  type ForgotResetSchema,
  type MobileSchema,
  type OtpSchema,
} from '../schemas/auth.schema';
import { readAuthErrorMessage } from './authError';
import { useOtpCountdown } from './useOtpCountdown';

export type ForgotStep = 1 | 2 | 3;

interface UseForgotPasswordOptions {
  /**
   * Called after the password is successfully reset. Receives the recovered
   * mobile so the coordinator can prefill the credential form and return the
   * card to password-login mode.
   */
  onComplete: (recoveredMobile: string) => void;
}

/**
 * Self-service password-recovery wizard embedded inside the login card
 * (mobile → OTP → new password) so recovery never navigates away. Owns its
 * three forms, resend countdown, and step state.
 */
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

  const forgotOtpForm = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { otp: '' },
  });

  const forgotResetForm = useForm<ForgotResetSchema>({
    resolver: zodResolver(forgotResetSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  /** Reset every recovery form (prefilling the mobile) and go to step 1. */
  const start = useCallback(
    (prefillMobile: string) => {
      forgotMobileForm.reset({ mobile: prefillMobile });
      forgotOtpForm.reset({ otp: '' });
      forgotResetForm.reset({ newPassword: '', confirmPassword: '' });
      setForgotStep(1);
    },
    [forgotMobileForm, forgotOtpForm, forgotResetForm]
  );

  const goBackToForgotStep1 = useCallback(() => {
    setForgotStep(1);
    forgotOtpForm.reset({ otp: '' });
  }, [forgotOtpForm]);

  const sendForgotOtp = forgotMobileForm.handleSubmit(async (data) => {
    try {
      const isSameNumber =
        data.mobile === pendingForgotMobile && !countdown.canResend;

      if (!isSameNumber) {
        await AuthService.sendForgotPasswordOtp(data.mobile);
        setPendingForgotMobile(data.mobile);
        countdown.restart();
      }

      setForgotStep(2);
      forgotOtpForm.reset({ otp: '' });
    } catch (error) {
      forgotMobileForm.setError('mobile', {
        message: readAuthErrorMessage(error, 'ارسال کد بازیابی ناموفق بود.'),
      });
    }
  });

  const verifyForgotOtp = forgotOtpForm.handleSubmit(async (data) => {
    try {
      await AuthService.verifyForgotPasswordOtp(pendingForgotMobile, data.otp);
      setForgotStep(3);
      forgotResetForm.reset({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      forgotOtpForm.setError('otp', {
        message: readAuthErrorMessage(error, 'تایید کد ناموفق بود.'),
      });
    }
  });

  const resendForgotOtp = useCallback(async () => {
    if (!countdown.canResend || isResendingForgotOtp) return;

    setIsResendingForgotOtp(true);
    try {
      await AuthService.sendForgotPasswordOtp(pendingForgotMobile);
      countdown.restart();
      forgotOtpForm.reset({ otp: '' });
    } catch (error) {
      forgotOtpForm.setError('otp', {
        message: readAuthErrorMessage(error, 'ارسال مجدد کد ناموفق بود.'),
      });
    } finally {
      setIsResendingForgotOtp(false);
    }
  }, [countdown, isResendingForgotOtp, pendingForgotMobile, forgotOtpForm]);

  const submitResetPassword = forgotResetForm.handleSubmit(async (data) => {
    try {
      await AuthService.resetPassword(
        pendingForgotMobile,
        forgotOtpForm.getValues('otp'),
        data.newPassword
      );
      onComplete(pendingForgotMobile);
    } catch (error) {
      forgotResetForm.setError('newPassword', {
        message: readAuthErrorMessage(error, 'تغییر رمز عبور ناموفق بود.'),
      });
    }
  });

  return {
    start,
    goBackToForgotStep1,
    forgotStep,
    forgotMobileForm,
    sendForgotOtp,
    isSendingForgotOtp: forgotMobileForm.formState.isSubmitting,
    forgotOtpForm,
    verifyForgotOtp,
    isVerifyingForgotOtp: forgotOtpForm.formState.isSubmitting,
    resendForgotOtp,
    isResendingForgotOtp,
    secondsUntilForgotResend: countdown.secondsLeft,
    canResendForgotOtp: countdown.canResend,
    forgotResetForm,
    submitResetPassword,
    isSubmittingResetPassword: forgotResetForm.formState.isSubmitting,
  };
}

export type UseForgotPasswordReturn = ReturnType<typeof useForgotPassword>;
