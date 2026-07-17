import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { RouteService } from '@/services/route.service';

import { usePasswordLogin } from './usePasswordLogin';
import { useOtpLogin } from './useOtpLogin';
import { useForgotPassword, type ForgotStep } from './useForgotPassword';

export type LoginMode = 'password' | 'otp' | 'forgot';
export type { ForgotStep };

/**
 * Coordinator for the public login card. Composes three single-responsibility
 * flow hooks — {@link usePasswordLogin}, {@link useOtpLogin},
 * {@link useForgotPassword} — and owns only the active `mode` plus the
 * cross-flow transitions between them (rule 40, #6: UI stays presentation-only).
 *
 * The return value is intentionally flattened so consuming components keep the
 * same API surface; errors still surface on the relevant field, never a banner.
 */
export function useLoginForm() {
  const router = useRouter();

  const [mode, setMode] = useState<LoginMode>('password');

  const goToDashboard = useCallback(() => {
    router.push(RouteService.karvita.dashboard());
  }, [router]);

  const password = usePasswordLogin({ onSuccess: goToDashboard });
  const otp = useOtpLogin({ onSuccess: goToDashboard });
  const forgot = useForgotPassword({
    onComplete: (recoveredMobile) => {
      password.passwordForm.reset({
        mobile: recoveredMobile,
        password: '',
        remember: false,
      });
      setMode('password');
    },
  });

  const switchToPasswordMode = useCallback(() => {
    setMode('password');
  }, []);

  const switchToOtpMode = useCallback(() => {
    otp.start(password.passwordForm.getValues('mobile'));
    setMode('otp');
  }, [otp, password.passwordForm]);

  /** Embeds the "فراموشی رمز عبور" wizard inside the login card instead of navigating away (no 404). */
  const switchToForgotMode = useCallback(() => {
    forgot.start(password.passwordForm.getValues('mobile'));
    setMode('forgot');
  }, [forgot, password.passwordForm]);

  const cancelForgotMode = useCallback(() => {
    setMode('password');
  }, []);

  return {
    mode,
    switchToOtpMode,
    switchToPasswordMode,

    passwordForm: password.passwordForm,
    submitPassword: password.submitPassword,
    isSubmittingPassword: password.isSubmittingPassword,

    otpStep: otp.otpStep,
    otpPendingMobile: otp.pendingMobile,
    otpMobileForm: otp.otpMobileForm,
    requestOtp: otp.requestOtp,
    isRequestingOtp: otp.isRequestingOtp,

    otpCodeForm: otp.otpCodeForm,
    verifyOtp: otp.verifyOtp,
    isVerifyingOtp: otp.isVerifyingOtp,
    goBackToPhoneStep: otp.goBackToPhoneStep,

    resendOtp: otp.resendOtp,
    isResendingOtp: otp.isResendingOtp,
    secondsUntilResend: otp.secondsUntilResend,
    canResendOtp: otp.canResendOtp,

    switchToForgotMode,
    cancelForgotMode,
    goBackToForgotStep1: forgot.goBackToForgotStep1,
    goBackToForgotStep2: forgot.goBackToForgotStep2,

    forgotStep: forgot.forgotStep,
    pendingForgotMobile: forgot.pendingForgotMobile,
    forgotMobileForm: forgot.forgotMobileForm,
    sendForgotOtp: forgot.sendForgotOtp,
    isSendingForgotOtp: forgot.isSendingForgotOtp,

    forgotOtpForm: forgot.forgotOtpForm,
    verifyForgotOtp: forgot.verifyForgotOtp,
    isVerifyingForgotOtp: forgot.isVerifyingForgotOtp,

    resendForgotOtp: forgot.resendForgotOtp,
    isResendingForgotOtp: forgot.isResendingForgotOtp,
    secondsUntilForgotResend: forgot.secondsUntilForgotResend,
    canResendForgotOtp: forgot.canResendForgotOtp,

    forgotResetForm: forgot.forgotResetForm,
    submitResetPassword: forgot.submitResetPassword,
    isSubmittingResetPassword: forgot.isSubmittingResetPassword,
  };
}

export type UseLoginFormReturn = ReturnType<typeof useLoginForm>;
