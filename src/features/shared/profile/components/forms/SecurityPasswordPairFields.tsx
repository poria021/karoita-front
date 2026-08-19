'use client';

import { useWatch, type UseFormReturn } from 'react-hook-form';
import dynamic from 'next/dynamic';

import { KvPasswordField } from '@/components/shared/fields/KvPasswordField';

const KvPasswordStrengthIndicator = dynamic(
  () =>
    import('@/components/shared/fields/KvPasswordStrengthIndicator').then(
      (mod) => ({ default: mod.KvPasswordStrengthIndicator })
    ),
  { ssr: false }
);

import type { SecurityPasswordSchema } from '../../schemas/security.schema';

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
      <KvPasswordField
        label="رمز عبور جدید"
        required
        autoComplete="new-password"
        locked={disabled}
        error={form.formState.errors.newPassword?.message}
        footer={<KvPasswordStrengthIndicator password={watchedPassword ?? ''} />}
        {...form.register('newPassword')}
      />
      <KvPasswordField
        label={confirmLabel}
        required
        autoComplete="new-password"
        locked={disabled}
        error={form.formState.errors.confirmPassword?.message}
        {...form.register('confirmPassword')}
      />
    </div>
  );
}
