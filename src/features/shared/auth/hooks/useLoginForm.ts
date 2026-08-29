import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { resolvePostAuthPath } from '@/services/post-login-path';
import { beginEnteringApp, waitForNextPaint } from '@/store/authTransition';
import { useUserStore } from '@/store/useUserStore';

import { forgotHref } from '../lib/authHrefs';
import {
  consumeAuthFlowMobilePrefill,
  writeAuthFlowMobilePrefill,
} from '../utils/authFlowMobilePrefill';
import { useOtpLogin } from './useOtpLogin';
import { usePasswordLogin } from './usePasswordLogin';

export type LoginMode = 'password' | 'otp';

export function useLoginForm(returnUrl: string | null) {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>('password');

  const goAfterLogin = useCallback(async () => {
    const user = useUserStore.getState().activeUser;
    beginEnteringApp();
    await waitForNextPaint();
    router.replace(resolvePostAuthPath(user, returnUrl));
  }, [returnUrl, router]);

  const password = usePasswordLogin({ onSuccess: goAfterLogin });
  const otp = useOtpLogin({ onSuccess: goAfterLogin });
  const [prefill] = useState(() => consumeAuthFlowMobilePrefill());

  useEffect(() => {
    if (!prefill) return;
    password.passwordForm.setValue('mobile', prefill, {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [prefill, password.passwordForm]);

  const switchToPasswordMode = useCallback(() => {
    setMode('password');
  }, []);

  const switchToOtpMode = useCallback(() => {
    otp.start(password.passwordForm.getValues('mobile'));
    setMode('otp');
  }, [otp.start, password.passwordForm]);

  const prepareForgot = useCallback(() => {
    writeAuthFlowMobilePrefill(password.passwordForm.getValues('mobile'));
  }, [password.passwordForm]);

  return {
    mode,
    switchToOtpMode,
    switchToPasswordMode,
    prepareForgot,
    forgotHref: forgotHref({ returnUrl }),

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
  };
}

export type UseLoginFormReturn = ReturnType<typeof useLoginForm>;
