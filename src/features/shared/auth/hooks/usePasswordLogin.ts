import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthService } from '@/services/auth.service';

import { loginSchema, type LoginSchema } from '../schemas/auth.schema';
import { readAuthErrorMessage } from './authError';

interface UsePasswordLoginOptions {
  /** Called after a successful credential login (e.g. redirect to dashboard). */
  onSuccess: () => void;
}

/**
 * Credential (mobile + password) login flow. Owns only its own form and
 * submit lifecycle — mode switching lives in the `useLoginForm` coordinator.
 * Unknown mobile → error on `mobile` only; other auth failures mark both fields.
 */
export function usePasswordLogin({ onSuccess }: UsePasswordLoginOptions) {
  const passwordForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { mobile: '', password: '', remember: false },
  });

  const submitPassword = passwordForm.handleSubmit(async (data) => {
    try {
      await AuthService.loginWithCredentials(data.mobile, data.password);
      onSuccess();
    } catch (error) {
      const message = readAuthErrorMessage(
        error,
        'شماره موبایل یا رمز عبور نادرست است.'
      );

      if (message === 'کاربری با این شماره یافت نشد.') {
        passwordForm.setError('mobile', { message });
        passwordForm.clearErrors('password');
        return;
      }

      passwordForm.setError('mobile', { message });
      passwordForm.setError('password', { message });
    }
  });

  return {
    passwordForm,
    submitPassword,
    isSubmittingPassword: passwordForm.formState.isSubmitting,
  };
}

export type UsePasswordLoginReturn = ReturnType<typeof usePasswordLogin>;
