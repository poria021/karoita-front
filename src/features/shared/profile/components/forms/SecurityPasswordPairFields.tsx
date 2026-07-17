'use client';

import { useWatch, type UseFormReturn } from 'react-hook-form';

import { KvTextField } from '@/components/shared/KvTextField';

import type { SecurityPasswordSchema } from '../../schemas/security.schema';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface SecurityPasswordPairFieldsProps {
  form: UseFormReturn<SecurityPasswordSchema>;
  disabled: boolean;
  confirmLabel?: string;
}

export function SecurityPasswordPairFields({
  form,
  disabled,
  confirmLabel = 'تکرار رمز عبور',
}: SecurityPasswordPairFieldsProps) {
  const watchedPassword = useWatch({
    control: form.control,
    name: 'newPassword',
  });

  return (
    <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2">
      <KvTextField
        label="رمز عبور جدید"
        required
        type="password"
        autoComplete="new-password"
        locked={disabled}
        placeholder="********"
        dir="ltr"
        error={form.formState.errors.newPassword?.message}
        footer={<PasswordStrengthIndicator password={watchedPassword} />}
        {...form.register('newPassword')}
      />
      <KvTextField
        label={confirmLabel}
        required
        type="password"
        autoComplete="new-password"
        locked={disabled}
        placeholder="********"
        dir="ltr"
        error={form.formState.errors.confirmPassword?.message}
        {...form.register('confirmPassword')}
      />
    </div>
  );
}
