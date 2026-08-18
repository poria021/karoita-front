'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';

import { RETURN_URL_PARAM } from '@/lib/return-url';
import { AuthService } from '@/services/auth.service';
import { resolvePostAuthPath } from '@/services/post-login-path';

import { mobileSchema, otpSchema, type MobileSchema, type OtpSchema } from '../schemas/auth.schema';
import { readAuthErrorMessage } from './authError';
import { useOtpCountdown } from './useOtpCountdown';

export type AdminGateStep = 1 | 2;

export function useAdminGate() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const goBackToMobileStep = useCallback(() => {
    setStep(1);
    otpForm.reset({ otp: '' });
  }, [otpForm]);

  const requestOtp = mobileForm.handleSubmit(async (data) => {
    try {
      const isSameNumber = data.mobile === pendingMobile && !countdown.canResend;

      if (!isSameNumber) {
        setStep(2);
        await AuthService.sendAdminGateOtp(data.mobile);
        setPendingMobile(data.mobile);
        countdown.restart();
      } else {
        setStep(2);
      }

      otpForm.reset({ otp: '' });
    } catch (error) {
      mobileForm.setError('mobile', {
        message: readAuthErrorMessage(error, 'ارسال کد تایید ناموفق بود.'),
      });
    }
  });

  const verifyOtp = otpForm.handleSubmit(async (data) => {
    try {
      const user = await AuthService.verifyAdminGateOtp(pendingMobile, data.otp);
      router.replace(
        resolvePostAuthPath(user, searchParams.get(RETURN_URL_PARAM))
      );
    } catch (error) {
      otpForm.setError('otp', {
        message: readAuthErrorMessage(error, 'تایید کد ناموفق بود.'),
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
        message: readAuthErrorMessage(error, 'ارسال مجدد کد ناموفق بود.'),
      });
    } finally {
      setIsResending(false);
    }
  }, [countdown, isResending, pendingMobile, otpForm]);

  return {
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
