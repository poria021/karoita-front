import { useCallback, useEffect, useState } from 'react';
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
import type { AuthFormMessageState } from '../types';
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
 */
export function useLoginForm() {
  const router = useRouter();

  const [mode, setMode] = useState<LoginMode>('password');
  const [otpStep, setOtpStep] = useState<1 | 2>(1);
  const [pendingMobile, setPendingMobile] = useState('');
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [formMessage, setFormMessage] = useState<AuthFormMessageState | null>(null);

  const [forgotStep, setForgotStep] = useState<ForgotStep>(1);
  const [pendingForgotMobile, setPendingForgotMobile] = useState('');
  const [isResendingForgotOtp, setIsResendingForgotOtp] = useState(false);

  const otpCountdown = useOtpCountdown();
  const forgotCountdown = useOtpCountdown();

  const passwordForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { mobile: '', password: '', remember: false },
  });

  const otpMobileForm = useForm<MobileSchema>({
    resolver: zodResolver(mobileSchema),
    mode: 'onChange',
    defaultValues: { mobile: '' },
  });

  const otpCodeForm = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    mode: 'onChange',
    defaultValues: { otp: '' },
  });

  const forgotMobileForm = useForm<MobileSchema>({
    resolver: zodResolver(mobileSchema),
    mode: 'onChange',
    defaultValues: { mobile: '' },
  });

  const forgotOtpForm = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    mode: 'onChange',
    defaultValues: { otp: '' },
  });

  const forgotResetForm = useForm<ForgotResetSchema>({
    resolver: zodResolver(forgotResetSchema),
    mode: 'onChange',
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const clearFormMessage = useCallback(() => setFormMessage(null), []);

  const goToDashboard = useCallback(() => {
    router.push(RouteService.karvita.dashboard());
  }, [router]);

  const switchToOtpMode = useCallback(() => {
    otpMobileForm.setValue('mobile', passwordForm.getValues('mobile'));
    setMode('otp');
    setOtpStep(1);
    setFormMessage(null);
  }, [otpMobileForm, passwordForm]);

  const switchToPasswordMode = useCallback(() => {
    setMode('password');
    setFormMessage(null);
  }, []);

  const goBackToPhoneStep = useCallback(() => {
    setOtpStep(1);
    otpCodeForm.reset({ otp: '' });
    setFormMessage(null);
  }, [otpCodeForm]);

const submitPassword = passwordForm.handleSubmit(
    // ورودی اول: اگر فیلدها پر و درست بودند این اجرا می‌شود
    async (data) => {
      setFormMessage(null);
      try {
        await AuthService.loginWithCredentials(data.mobile, data.password);
        goToDashboard();
      } catch (error) {
        setFormMessage({ type: 'error', text: readErrorMessage(error, 'ورود ناموفق بود.') });
      }
    },
    // ورودی دوم (جدید): اگر فیلدها خالی یا نامعتبر بودند و کاربر کلیک کرد، این اجرا می‌شود
    () => {
      setFormMessage({
        type: 'error',
        text: 'لطفاً شماره موبایل و رمز عبور خود را به درستی وارد کنید.',
      });
    }
  );

  const requestOtp = otpMobileForm.handleSubmit(async (data) => {
    setFormMessage(null);
    try {
      await AuthService.sendLoginOtp(data.mobile);
      setPendingMobile(data.mobile);
      setOtpStep(2);
      otpCodeForm.reset({ otp: '' });
      otpCountdown.restart();
    } catch (error) {
      setFormMessage({ type: 'error', text: readErrorMessage(error, 'ارسال کد تایید ناموفق بود.') });
    }
  });

  const verifyOtp = otpCodeForm.handleSubmit(async (data) => {
    setFormMessage(null);
    try {
      await AuthService.verifyLoginOtp(pendingMobile, data.otp);
      goToDashboard();
    } catch (error) {
      setFormMessage({ type: 'error', text: readErrorMessage(error, 'تایید کد ناموفق بود.') });
    }
  });

  const resendOtp = useCallback(async () => {
    if (!otpCountdown.canResend || isResendingOtp) return;

    setIsResendingOtp(true);
    setFormMessage(null);
    try {
      await AuthService.sendLoginOtp(pendingMobile);
      otpCountdown.restart();
      setFormMessage({ type: 'success', text: 'کد تایید جدید ارسال شد.' });
    } catch (error) {
      setFormMessage({ type: 'error', text: readErrorMessage(error, 'ارسال مجدد کد ناموفق بود.') });
    } finally {
      setIsResendingOtp(false);
    }
  }, [isResendingOtp, otpCountdown, pendingMobile]);

  /** Embeds the "فراموشی رمز عبور" wizard inside the login card instead of navigating away (no 404). */
  const switchToForgotMode = useCallback(() => {
    forgotMobileForm.reset({ mobile: passwordForm.getValues('mobile') });
    forgotOtpForm.reset({ otp: '' });
    forgotResetForm.reset({ newPassword: '', confirmPassword: '' });
    setMode('forgot');
    setForgotStep(1);
    setFormMessage(null);
  }, [forgotMobileForm, forgotOtpForm, forgotResetForm, passwordForm]);

  const cancelForgotMode = useCallback(() => {
    setMode('password');
    setFormMessage(null);
  }, []);

  const goBackToForgotStep1 = useCallback(() => {
    setForgotStep(1);
    forgotOtpForm.reset({ otp: '' });
    setFormMessage(null);
  }, [forgotOtpForm]);

  const sendForgotOtp = forgotMobileForm.handleSubmit(async (data) => {
    setFormMessage(null);
    try {
      await AuthService.sendForgotPasswordOtp(data.mobile);
      setPendingForgotMobile(data.mobile);
      setForgotStep(2);
      forgotOtpForm.reset({ otp: '' });
      forgotCountdown.restart();
    } catch (error) {
      setFormMessage({ type: 'error', text: readErrorMessage(error, 'ارسال کد بازیابی ناموفق بود.') });
    }
  });

  const verifyForgotOtp = forgotOtpForm.handleSubmit(async (data) => {
    setFormMessage(null);
    try {
      await AuthService.verifyForgotPasswordOtp(pendingForgotMobile, data.otp);
      setForgotStep(3);
      forgotResetForm.reset({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      setFormMessage({ type: 'error', text: readErrorMessage(error, 'تایید کد ناموفق بود.') });
    }
  });

  const resendForgotOtp = useCallback(async () => {
    if (!forgotCountdown.canResend || isResendingForgotOtp) return;

    setIsResendingForgotOtp(true);
    setFormMessage(null);
    try {
      await AuthService.sendForgotPasswordOtp(pendingForgotMobile);
      forgotCountdown.restart();
      setFormMessage({ type: 'success', text: 'کد تایید جدید ارسال شد.' });
    } catch (error) {
      setFormMessage({ type: 'error', text: readErrorMessage(error, 'ارسال مجدد کد ناموفق بود.') });
    } finally {
      setIsResendingForgotOtp(false);
    }
  }, [forgotCountdown, isResendingForgotOtp, pendingForgotMobile]);

  const submitResetPassword = forgotResetForm.handleSubmit(async (data) => {
    setFormMessage(null);
    try {
      await AuthService.resetPassword(pendingForgotMobile, forgotOtpForm.getValues('otp'), data.newPassword);
      passwordForm.reset({ mobile: pendingForgotMobile, password: '', remember: false });
      setMode('password');
      setFormMessage({ type: 'success', text: 'رمز عبور با موفقیت تغییر کرد. اکنون وارد شوید.' });
    } catch (error) {
      setFormMessage({ type: 'error', text: readErrorMessage(error, 'تغییر رمز عبور ناموفق بود.') });
    }
  });


  // مانیتور کردن مقادیر فیلدها در لحظه تایپ کاربر
  const watchedPasswordMobile = passwordForm.watch('mobile');
  const watchedPasswordPass = passwordForm.watch('password');
  const watchedOtpMobile = otpMobileForm.watch('mobile');
  const watchedForgotMobile = forgotMobileForm.watch('mobile');

  // به محض تایپ اولین کاراکتر جدید در هر فیلد، پیام خطای بالا فوراً غیب می‌شود
  useEffect(() => {
    setFormMessage(null);
  }, [watchedPasswordMobile, watchedPasswordPass, watchedOtpMobile, watchedForgotMobile]);

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

    formMessage,
    clearFormMessage,
  };
}

export type UseLoginFormReturn = ReturnType<typeof useLoginForm>;
