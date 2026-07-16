import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { AuthService } from '@/services/auth.service';
import { RouteService } from '@/services/route.service';

import { otpSchema, registerSchema, type OtpSchema, type RegisterSchema, type SelfRegisterableRole } from '../schemas/auth.schema';
import type { AuthFormMessageState } from '../types';
import { useOtpCountdown } from './useOtpCountdown';

export type RegisterStep = 1 | 2;

function readErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/**
 * Encapsulates the two-step registration wizard (details -> OTP) consumed by
 * `RegisterForm.tsx`. Per rule 11, each wizard step is rendered by its own
 * `.tsx` component; this hook only owns state, validation, and `AuthService`
 * calls — never JSX.
 */
export function useRegisterForm() {
  const router = useRouter();

  const [step, setStep] = useState<RegisterStep>(1);
  const [pendingMobile, setPendingMobile] = useState('');
  const [pendingRole, setPendingRole] = useState<SelfRegisterableRole | null>(null);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [formMessage, setFormMessage] = useState<AuthFormMessageState | null>(null);

  const otpCountdown = useOtpCountdown();

  const detailsForm = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: { mobile: '', role: undefined },
  });

  const otpForm = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    mode: 'onChange',
    defaultValues: { otp: '' },
  });

  const clearFormMessage = useCallback(() => setFormMessage(null), []);

  const goBackToStep1 = useCallback(() => {
    setStep(1);
    otpForm.reset({ otp: '' });
    setFormMessage(null);
  }, [otpForm]);

  const submitDetails = detailsForm.handleSubmit(async (data) => {
    setFormMessage(null);
    try {
      // اگر شماره موبایل همان شماره قبلی ثبت‌نام باشد و زمان‌سنج هنوز تمام نشده باشد، فیلتر کن
      const isSameNumber = data.mobile === pendingMobile && !otpCountdown.canResend;

      if (!isSameNumber) {
        await AuthService.register({ mobile: data.mobile, role: data.role });
        setPendingMobile(data.mobile);
        setPendingRole(data.role);
        otpCountdown.restart();
      }

      setStep(2);
      otpForm.reset({ otp: '' });
    } catch (error) {
      setFormMessage({ type: 'error', text: readErrorMessage(error, 'ثبت‌نام ناموفق بود.') });
    }
  });

  const verifyOtp = otpForm.handleSubmit(async (data) => {
    if (!pendingRole) {
      setFormMessage({ type: 'error', text: 'لطفاً ابتدا مرحله اول ثبت‌نام را کامل کنید.' });
      return;
    }

    setFormMessage(null);
    try {
      await AuthService.verifyRegistrationOtp(pendingMobile, data.otp, pendingRole);
      router.push(RouteService.shared.profileIdentity());
    } catch (error) {
      setFormMessage({ type: 'error', text: readErrorMessage(error, 'تایید کد ناموفق بود.') });
    }
  });

  const resendOtp = useCallback(async () => {
    if (!otpCountdown.canResend || isResendingOtp) return;

    setIsResendingOtp(true);
    setFormMessage(null);
    try {
      await AuthService.register({ mobile: pendingMobile, role: pendingRole as SelfRegisterableRole });
      otpCountdown.restart();
      otpForm.reset({ otp: '' });
      setFormMessage({ type: 'success', text: 'کد تایید جدید ارسال شد.' });
    } catch (error) {
      setFormMessage({ type: 'error', text: readErrorMessage(error, 'ارسال مجدد کد ناموفق بود.') });
    } finally {
      setIsResendingOtp(false);
    }
  }, [isResendingOtp, otpCountdown, pendingMobile, pendingRole, otpForm]);

  // ==========================================
  // [MIGRATION MOCK TO NESTJS]: فعال‌سازی Web OTP در ثبت‌نام موبایل
  // به محض نهایی شدن دامنه و فرمت پیامک NestJS، کامنت‌های زیر را بردارید:
  //
  // useWebOtp((code) => {
  //   otpForm.setValue('otp', code, { shouldValidate: true });
  //   verifyOtp(); // تایید و ثبت‌نام خودکار به محض خواندن پیامک
  // }, step === 2);
  // ==========================================

  return {
    step,
    goBackToStep1,

    detailsForm,
    submitDetails,
    isSubmittingDetails: detailsForm.formState.isSubmitting,

    otpForm,
    verifyOtp,
    isVerifyingOtp: otpForm.formState.isSubmitting,

    resendOtp,
    isResendingOtp,
    secondsUntilResend: otpCountdown.secondsLeft,
    canResendOtp: otpCountdown.canResend,

    formMessage,
    clearFormMessage,
  };
}

export type UseRegisterFormReturn = ReturnType<typeof useRegisterForm>;
