import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthService } from '@/services/auth.service';

import { loginSchema, type LoginSchema } from '../schemas/auth.schema';
import {
  clearRememberedMobile,
  readRememberedMobile,
  writeRememberedMobile,
} from '../utils/rememberedMobile';
import { readAuthErrorMessage } from './authError';

interface UsePasswordLoginOptions {
  onSuccess: () => void | Promise<void>;
}

export function usePasswordLogin({ onSuccess }: UsePasswordLoginOptions) {
  const passwordForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { mobile: '', password: '', remember: false },
  });

  useEffect(() => {
    const mobile = readRememberedMobile();
    if (!mobile) return;
    passwordForm.reset({
      mobile,
      password: '',
      remember: true,
    });
  }, [passwordForm]);

  const submitPassword = passwordForm.handleSubmit(async (data) => {
    try {
      await AuthService.loginWithCredentials(data.mobile, data.password);

      if (data.remember) {
        writeRememberedMobile(data.mobile);
      } else {
        clearRememberedMobile();
      }

      passwordForm.setValue('password', '', {
        shouldDirty: false,
        shouldValidate: false,
      });

      await onSuccess();
    } catch (error) {
      const message = readAuthErrorMessage(
        error,
        'شماره موبایل یا رمز عبور نادرست است.'
      );

      if (message === 'کاربری با این شماره یافت نشد.') {
        passwordForm.setError('mobile', { message }, { shouldFocus: true });
        passwordForm.clearErrors('password');
        return;
      }

      passwordForm.setError('mobile', { message }, { shouldFocus: true });
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
