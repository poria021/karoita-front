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
 * Server errors surface on the `password` field (no top-level banner).
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
      passwordForm.setError('password', {
        message: readAuthErrorMessage(error, 'ورود ناموفق بود.'),
      });
    }
  });

  return {
    passwordForm,
    submitPassword,
    isSubmittingPassword: passwordForm.formState.isSubmitting,
  };
}

export type UsePasswordLoginReturn = ReturnType<typeof usePasswordLogin>;
