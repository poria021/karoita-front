import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { AuthService } from '@/services/auth.service';
import {
  forgotOtpResetSchema,
  type ForgotOtpResetSchema,
} from '@/features/shared/auth/schemas/auth.schema';
import { isOtpAuthError, readAuthErrorMessage } from '@/features/shared/auth/hooks/authError';
import { useOtpCountdown } from '@/features/shared/auth/hooks/useOtpCountdown';

type ProfileForgotStep = 1 | 2;

interface UseProfileForgotPasswordOptions {
  mobile: string;
  onComplete: () => void;
}

export function useProfileForgotPassword({
  mobile,
  onComplete,
}: UseProfileForgotPasswordOptions) {
  const [forgotStep, setForgotStep] = useState<ProfileForgotStep>(1);
  const [isResendingForgotOtp, setIsResendingForgotOtp] = useState(false);
  const countdown = useOtpCountdown();

  const forgotOtpResetForm = useForm<ForgotOtpResetSchema>({
    resolver: zodResolver(forgotOtpResetSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
  });

  const start = useCallback(() => {
    forgotOtpResetForm.reset({ otp: '', newPassword: '', confirmPassword: '' });
    setForgotStep(1);
  }, [forgotOtpResetForm]);

  const goBackToForgotStep1 = useCallback(() => {
    setForgotStep(1);
    forgotOtpResetForm.reset({ otp: '', newPassword: '', confirmPassword: '' });
  }, [forgotOtpResetForm]);

  const sendForgotOtp = useCallback(async () => {
    try {
      const { retryAfterSeconds } = await AuthService.sendForgotPasswordOtp(mobile);
      countdown.restart(retryAfterSeconds);
      setForgotStep(2);
      forgotOtpResetForm.reset({ otp: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(readAuthErrorMessage(error));
    }
  }, [mobile, countdown, forgotOtpResetForm]);

  const resendForgotOtp = useCallback(async () => {
    if (!countdown.canResend || isResendingForgotOtp) return;

    setIsResendingForgotOtp(true);
    try {
      const { retryAfterSeconds } = await AuthService.sendForgotPasswordOtp(mobile);
      countdown.restart(retryAfterSeconds);
      forgotOtpResetForm.setValue('otp', '', {
        shouldDirty: false,
        shouldValidate: false,
      });
    } catch (error) {
      toast.error(readAuthErrorMessage(error));
    } finally {
      setIsResendingForgotOtp(false);
    }
  }, [countdown, isResendingForgotOtp, mobile, forgotOtpResetForm]);

  const submitResetPassword = forgotOtpResetForm.handleSubmit(async (data) => {
    try {
      await AuthService.resetPassword(mobile, data.otp, data.newPassword);
      toast.success('رمز عبور با موفقیت تغییر کرد.');
      onComplete();
    } catch (error) {
      const message = readAuthErrorMessage(error);
      if (isOtpAuthError(error)) {
        forgotOtpResetForm.setError('otp', { message }, { shouldFocus: true });
        forgotOtpResetForm.clearErrors(['newPassword', 'confirmPassword']);
        return;
      }
      forgotOtpResetForm.setError('newPassword', { message }, { shouldFocus: true });
    }
  });

  return {
    start,
    goBackToForgotStep1,
    forgotStep,
    forgotOtpResetForm,
    submitResetPassword,
    isSubmittingResetPassword: forgotOtpResetForm.formState.isSubmitting,
    sendForgotOtp,
    isSendingForgotOtp: false,
    resendForgotOtp,
    isResendingForgotOtp,
    secondsUntilForgotResend: countdown.secondsLeft,
    canResendForgotOtp: countdown.canResend,
  };
}

export type UseProfileForgotPasswordReturn = ReturnType<
  typeof useProfileForgotPassword
>;
