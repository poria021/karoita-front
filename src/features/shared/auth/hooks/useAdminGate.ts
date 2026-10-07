'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';

import { RETURN_URL_PARAM } from '@/lib/return-url';
import { AuthService } from '@/services/auth.service';
import { resolvePostAuthPath } from '@/services/post-login-path';
import { beginEnteringApp } from '@/store/authTransition';

import {
  adminPasswordLoginSchema,
  mobileSchema,
  otpSchema,
  type AdminPasswordLoginSchema,
  type MobileSchema,
  type OtpSchema,
} from '../schemas/auth.schema';
import { readAuthErrorMessage } from './authError';
import { useOtpCountdown } from './useOtpCountdown';

export type AdminGateStep = 1 | 2;
export type AdminGateMode = 'password' | 'otp';

export function useAdminGate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AdminGateMode>('password');
  const [step, setStep] = useState<AdminGateStep>(1);
  const [pendingMobile, setPendingMobile] = useState('');
  const [isResending, setIsResending] = useState(false);
  const countdown = useOtpCountdown();

  const mobileForm = useForm<MobileSchema>({
    resolver: zodResolver(mobileSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { mobile: '' },
  });

  const otpForm = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { otp: '' },
  });

  const passwordForm = useForm<AdminPasswordLoginSchema>({
    resolver: zodResolver(adminPasswordLoginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { mobile: '', password: '' },
  });

  const submitPassword = passwordForm.handleSubmit(async (data) => {
    try {
      const user = await AuthService.loginAdminWithPassword(data.mobile, data.password);
      passwordForm.setValue('password', '', {
        shouldDirty: false,
        shouldValidate: false,
      });
      beginEnteringApp();
      router.replace(
        resolvePostAuthPath(user, searchParams.get(RETURN_URL_PARAM))
      );
    } catch (error) {
      const message = readAuthErrorMessage(error);
      passwordForm.setError('mobile', { message }, { shouldFocus: true });
      passwordForm.setError('password', { message });
    }
  });

  const switchToOtpMode = useCallback(() => {
    const mobile = passwordForm.getValues('mobile');
    if (mobile) {
      mobileForm.setValue('mobile', mobile, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
    setStep(1);
    setMode('otp');
  }, [mobileForm, passwordForm]);

  const switchToPasswordMode = useCallback(() => {
    const mobile = mobileForm.getValues('mobile');
    if (mobile) {
      passwordForm.setValue('mobile', mobile, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
    setMode('password');
  }, [mobileForm, passwordForm]);

  const goBackToMobileStep = useCallback(() => {
    setStep(1);
    otpForm.reset({ otp: '' });
  }, [otpForm]);

  const requestOtp = mobileForm.handleSubmit(async (data) => {
    try {
      const isSameNumber = data.mobile === pendingMobile && !countdown.canResend;

      if (!isSameNumber) {
        await AuthService.sendAdminGateOtp(data.mobile);
        setPendingMobile(data.mobile);
        countdown.restart();
        setStep(2);
      } else {
        setStep(2);
      }

      otpForm.reset({ otp: '' });

      try {
        if (typeof document !== 'undefined') {
          setTimeout(() => {
            const el = document.getElementById('admin-gate-otp');
            if (el && typeof (el as HTMLElement).focus === 'function') {
              (el as HTMLElement).focus();
            }
          }, 50);
        }
      } catch {
        // Ignore focus failures in non-browser environments.
      }
    } catch (error) {
      mobileForm.setError('mobile', {
        message: readAuthErrorMessage(error),
      });
    }
  });

  const verifyOtp = otpForm.handleSubmit(async (data) => {
    try {
      const user = await AuthService.verifyAdminGateOtp(pendingMobile, data.otp);
      beginEnteringApp();
      router.replace(
        resolvePostAuthPath(user, searchParams.get(RETURN_URL_PARAM))
      );
    } catch (error) {
      otpForm.setError('otp', {
        message: readAuthErrorMessage(error),
      });
    }
  });

  const resendOtp = useCallback(async () => {
    if (!countdown.canResend || isResending || !pendingMobile) return;

    setIsResending(true);
    try {
      await AuthService.sendAdminGateOtp(pendingMobile);
      countdown.restart();
      otpForm.reset({ otp: '' });
    } catch (error) {
      otpForm.setError('otp', {
        message: readAuthErrorMessage(error),
      });
    } finally {
      setIsResending(false);
    }
  }, [countdown, isResending, pendingMobile, otpForm]);

  return {
    mode,
    switchToOtpMode,
    switchToPasswordMode,
    passwordForm,
    submitPassword,
    isSubmittingPassword: passwordForm.formState.isSubmitting,
    step,
    pendingMobile,
    mobileForm,
    requestOtp,
    isRequestingOtp: mobileForm.formState.isSubmitting,
    otpForm,
    verifyOtp,
    isVerifyingOtp: otpForm.formState.isSubmitting,
    goBackToMobileStep,
    resendOtp,
    isResending,
    secondsUntilResend: countdown.secondsLeft,
    canResend: countdown.canResend,
  };
}

export type UseAdminGateReturn = ReturnType<typeof useAdminGate>;