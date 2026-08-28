import { useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { RETURN_URL_PARAM } from '@/lib/return-url';
import { resolvePostAuthPath } from '@/services/post-login-path';
import { beginEnteringApp } from '@/store/authTransition';
import { useUserStore } from '@/store/useUserStore';

import { usePasswordLogin } from './usePasswordLogin';
import { useOtpLogin } from './useOtpLogin';
import { useForgotPassword, type ForgotStep } from './useForgotPassword';

export type LoginMode = 'password' | 'otp' | 'forgot';
export type { ForgotStep };

export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<LoginMode>('password');

  const goAfterLogin = useCallback(() => {
    const user = useUserStore.getState().activeUser;
    const rawReturn = searchParams.get(RETURN_URL_PARAM);
    beginEnteringApp();
    router.replace(resolvePostAuthPath(user, rawReturn));
  }, [router, searchParams]);

  const password = usePasswordLogin({ onSuccess: goAfterLogin });
  const otp = useOtpLogin({ onSuccess: goAfterLogin });
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
