import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthService } from '@/services/auth.service';

import { mobileSchema, otpSchema, type MobileSchema, type OtpSchema } from '../schemas/auth.schema';
import { readAuthErrorMessage } from './authError';
import { useOtpCountdown } from './useOtpCountdown';

interface UseOtpLoginOptions {
  /** Called after a successful OTP verification (e.g. redirect to dashboard). */
  onSuccess: () => void;
}

/**
 * Passwordless (SMS OTP) login flow: request the code (step 1) then verify it
 * (step 2). Owns its own two forms, resend countdown, and step state. Mode
 * switching is delegated to the `useLoginForm` coordinator via {@link start}.
 */
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

  /** Prefill the mobile number and reset to step 1 when entering OTP mode. */
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
        message: readAuthErrorMessage(error, 'ارسال کد تایید ناموفق بود.'),
      });
    }
  });

  const verifyOtp = otpCodeForm.handleSubmit(async (data) => {
    try {
      await AuthService.verifyLoginOtp(pendingMobile, data.otp);
      onSuccess();
    } catch (error) {
      otpCodeForm.setError('otp', {
        message: readAuthErrorMessage(error, 'تایید کد ناموفق بود.'),
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
        message: readAuthErrorMessage(error, 'ارسال مجدد کد ناموفق بود.'),
      });
    } finally {
      setIsResendingOtp(false);
    }
  }, [isResendingOtp, countdown, pendingMobile, otpCodeForm]);

  // ==========================================
  // [MIGRATION MOCK TO NESTJS]: فعال‌سازی Web OTP در موبایل
  // به محض نهایی شدن دامنه و فرمت پیامک NestJS، کامنت‌های زیر را بردارید:
  //
  // useWebOtp((code) => {
  //   otpCodeForm.setValue('otp', code, { shouldValidate: true });
  //   verifyOtp(); // ورود خودکار به محض خواندن پیامک
  // }, otpStep === 2);
  // ==========================================

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
