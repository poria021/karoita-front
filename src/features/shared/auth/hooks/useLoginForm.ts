import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { AuthService } from '@/services/auth.service';
import { RouteService } from '@/services/route.service';

import {
  forgotResetSchema,
  loginSchema,
  mobileSchema,
  otpSchema,
  type ForgotResetSchema,
  type LoginSchema,
  type MobileSchema,
  type OtpSchema,
} from '../schemas/auth.schema';
import { useOtpCountdown } from './useOtpCountdown';

export type LoginMode = 'password' | 'otp' | 'forgot';
export type ForgotStep = 1 | 2 | 3;

function readErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/**
 * Encapsulates every state, resolver, and `AuthService` call needed by
 * `LoginForm.tsx`. UI components stay presentation-only (rule 40, #6): they
 * never call `AuthService` or manage validation state directly.
 *
 * Errors surface on the relevant field via `setError` — no top-level banner.
 */
export function useLoginForm() {
  const router = useRouter();

  const [mode, setMode] = useState<LoginMode>('password');
  const [otpStep, setOtpStep] = useState<1 | 2>(1);
  const [pendingMobile, setPendingMobile] = useState('');
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  const [forgotStep, setForgotStep] = useState<ForgotStep>(1);
  const [pendingForgotMobile, setPendingForgotMobile] = useState('');
  const [isResendingForgotOtp, setIsResendingForgotOtp] = useState(false);

  const otpCountdown = useOtpCountdown();
  const forgotCountdown = useOtpCountdown();

  const passwordForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { mobile: '', password: '', remember: false },
  });

  const otpMobileForm = useForm<MobileSchema>({
    resolver: zodResolver(mobileSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { mobile: '' },
  });

  const otpCodeForm = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { otp: '' },
  });

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

  const goToDashboard = useCallback(() => {
    router.push(RouteService.karvita.dashboard());
  }, [router]);

  const switchToOtpMode = useCallback(() => {
    otpMobileForm.setValue('mobile', passwordForm.getValues('mobile'));
    setMode('otp');
    setOtpStep(1);
  }, [otpMobileForm, passwordForm]);

  const switchToPasswordMode = useCallback(() => {
    setMode('password');
  }, []);

  const goBackToPhoneStep = useCallback(() => {
    setOtpStep(1);
    otpCodeForm.reset({ otp: '' });
  }, [otpCodeForm]);

  const submitPassword = passwordForm.handleSubmit(async (data) => {
    try {
      await AuthService.loginWithCredentials(data.mobile, data.password);
      goToDashboard();
    } catch (error) {
      passwordForm.setError('password', {
        message: readErrorMessage(error, 'ورود ناموفق بود.'),
      });
    }
  });

  const requestOtp = otpMobileForm.handleSubmit(async (data) => {
    try {
      const isSameNumber = data.mobile === pendingMobile && !otpCountdown.canResend;

      if (!isSameNumber) {
        await AuthService.sendLoginOtp(data.mobile);
        setPendingMobile(data.mobile);
        otpCountdown.restart();
      }

      setOtpStep(2);
      otpCodeForm.reset({ otp: '' });
    } catch (error) {
      otpMobileForm.setError('mobile', {
        message: readErrorMessage(error, 'ارسال کد تایید ناموفق بود.'),
      });
    }
  });

  const verifyOtp = otpCodeForm.handleSubmit(async (data) => {
    try {
      await AuthService.verifyLoginOtp(pendingMobile, data.otp);
      goToDashboard();
    } catch (error) {
      otpCodeForm.setError('otp', {
        message: readErrorMessage(error, 'تایید کد ناموفق بود.'),
      });
    }
  });

  const resendOtp = useCallback(async () => {
    if (!otpCountdown.canResend || isResendingOtp) return;

    setIsResendingOtp(true);
    try {
      await AuthService.sendLoginOtp(pendingMobile);
      otpCountdown.restart();
      otpCodeForm.reset({ otp: '' });
    } catch (error) {
      otpCodeForm.setError('otp', {
        message: readErrorMessage(error, 'ارسال مجدد کد ناموفق بود.'),
      });
    } finally {
      setIsResendingOtp(false);
    }
  }, [isResendingOtp, otpCountdown, pendingMobile, otpCodeForm]);

  /** Embeds the "فراموشی رمز عبور" wizard inside the login card instead of navigating away (no 404). */
  const switchToForgotMode = useCallback(() => {
    forgotMobileForm.reset({ mobile: passwordForm.getValues('mobile') });
    forgotOtpForm.reset({ otp: '' });
    forgotResetForm.reset({ newPassword: '', confirmPassword: '' });
    setMode('forgot');
    setForgotStep(1);
  }, [forgotMobileForm, forgotOtpForm, forgotResetForm, passwordForm]);

  const cancelForgotMode = useCallback(() => {
    setMode('password');
  }, []);

  const goBackToForgotStep1 = useCallback(() => {
    setForgotStep(1);
    forgotOtpForm.reset({ otp: '' });
  }, [forgotOtpForm]);

  const sendForgotOtp = forgotMobileForm.handleSubmit(async (data) => {
    try {
      const isSameNumber =
        data.mobile === pendingForgotMobile && !forgotCountdown.canResend;

      if (!isSameNumber) {
        await AuthService.sendForgotPasswordOtp(data.mobile);
        setPendingForgotMobile(data.mobile);
        forgotCountdown.restart();
      }

      setForgotStep(2);
      forgotOtpForm.reset({ otp: '' });
    } catch (error) {
      forgotMobileForm.setError('mobile', {
        message: readErrorMessage(error, 'ارسال کد بازیابی ناموفق بود.'),
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
        message: readErrorMessage(error, 'تایید کد ناموفق بود.'),
      });
    }
  });

  const resendForgotOtp = useCallback(async () => {
    if (!forgotCountdown.canResend || isResendingForgotOtp) return;

    setIsResendingForgotOtp(true);
    try {
      await AuthService.sendForgotPasswordOtp(pendingForgotMobile);
      forgotCountdown.restart();
      forgotOtpForm.reset({ otp: '' });
    } catch (error) {
      forgotOtpForm.setError('otp', {
        message: readErrorMessage(error, 'ارسال مجدد کد ناموفق بود.'),
      });
    } finally {
      setIsResendingForgotOtp(false);
    }
  }, [forgotCountdown, isResendingForgotOtp, pendingForgotMobile, forgotOtpForm]);

  const submitResetPassword = forgotResetForm.handleSubmit(async (data) => {
    try {
      await AuthService.resetPassword(
        pendingForgotMobile,
        forgotOtpForm.getValues('otp'),
        data.newPassword
      );
      passwordForm.reset({
        mobile: pendingForgotMobile,
        password: '',
        remember: false,
      });
      setMode('password');
    } catch (error) {
      forgotResetForm.setError('newPassword', {
        message: readErrorMessage(error, 'تغییر رمز عبور ناموفق بود.'),
      });
    }
  });

  // ==========================================
  // [MIGRATION MOCK TO NESTJS]: فعال‌سازی Web OTP در موبایل
  // به محض نهایی شدن دامنه و فرمت پیامک NestJS، کامنت‌های زیر را بردارید:
  //
  // useWebOtp((code) => {
  //   otpCodeForm.setValue('otp', code, { shouldValidate: true });
  //   verifyOtp(); // ورود خودکار به محض خواندن پیامک
  // }, mode === 'otp' && otpStep === 2);
  // ==========================================

  return {
    mode,
    switchToOtpMode,
    switchToPasswordMode,

    passwordForm,
    submitPassword,
    isSubmittingPassword: passwordForm.formState.isSubmitting,

    otpStep,
    otpMobileForm,
    requestOtp,
    isRequestingOtp: otpMobileForm.formState.isSubmitting,

    otpCodeForm,
    verifyOtp,
    isVerifyingOtp: otpCodeForm.formState.isSubmitting,
    goBackToPhoneStep,

    resendOtp,
    isResendingOtp,
    secondsUntilResend: otpCountdown.secondsLeft,
    canResendOtp: otpCountdown.canResend,

    switchToForgotMode,
    cancelForgotMode,
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
    secondsUntilForgotResend: forgotCountdown.secondsLeft,
    canResendForgotOtp: forgotCountdown.canResend,

    forgotResetForm,
    submitResetPassword,
    isSubmittingResetPassword: forgotResetForm.formState.isSubmitting,
  };
}

export type UseLoginFormReturn = ReturnType<typeof useLoginForm>;
