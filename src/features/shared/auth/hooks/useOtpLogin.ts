import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthService } from '@/services/auth.service';

import { mobileSchema, otpSchema, type MobileSchema, type OtpSchema } from '../schemas/auth.schema';
import { readAuthErrorMessage } from './authError';
import { useOtpCountdown } from './useOtpCountdown';

interface UseOtpLoginOptions {
  onSuccess: () => void | Promise<void>;
}

export function useOtpLogin({ onSuccess }: UseOtpLoginOptions) {
  const [otpStep, setOtpStep] = useState<1 | 2>(1);
  const [pendingMobile, setPendingMobile] = useState('');
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const countdown = useOtpCountdown();

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

  const start = useCallback(
    (prefillMobile: string) => {
      otpMobileForm.setValue('mobile', prefillMobile);
      setOtpStep(1);
    },
    [otpMobileForm]
  );

  const goBackToPhoneStep = useCallback(() => {
    setOtpStep(1);
    otpCodeForm.reset({ otp: '' });
  }, [otpCodeForm]);

  const requestOtp = otpMobileForm.handleSubmit(async (data) => {
    try {
      const isSameNumber = data.mobile === pendingMobile && !countdown.canResend;

      if (!isSameNumber) {
        await AuthService.sendLoginOtp(data.mobile);
        setPendingMobile(data.mobile);
        countdown.restart();
      }

      setOtpStep(2);
      otpCodeForm.reset({ otp: '' });
    } catch (error) {
      otpMobileForm.setError('mobile', {
        message: readAuthErrorMessage(error),
      });
    }
  });

  const verifyOtp = otpCodeForm.handleSubmit(async (data) => {
    try {
      await AuthService.verifyLoginOtp(pendingMobile, data.otp);
      await onSuccess();
    } catch (error) {
      otpCodeForm.setError('otp', {
        message: readAuthErrorMessage(error),
      });
    }
  });

  const resendOtp = useCallback(async () => {
    if (!countdown.canResend || isResendingOtp) return;

    setIsResendingOtp(true);
    try {
      await AuthService.sendLoginOtp(pendingMobile);
      countdown.restart();
      otpCodeForm.reset({ otp: '' });
    } catch (error) {
      otpCodeForm.setError('otp', {
        message: readAuthErrorMessage(error),
      });
    } finally {
      setIsResendingOtp(false);
    }
  }, [isResendingOtp, countdown, pendingMobile, otpCodeForm]);


  return {
    start,
    otpStep,
    pendingMobile,
    otpMobileForm,
    requestOtp,
    isRequestingOtp: otpMobileForm.formState.isSubmitting,
    otpCodeForm,
    verifyOtp,
    isVerifyingOtp: otpCodeForm.formState.isSubmitting,
    goBackToPhoneStep,
    resendOtp,
    isResendingOtp,
    secondsUntilResend: countdown.secondsLeft,
    canResendOtp: countdown.canResend,
  };
}

export type UseOtpLoginReturn = ReturnType<typeof useOtpLogin>;
