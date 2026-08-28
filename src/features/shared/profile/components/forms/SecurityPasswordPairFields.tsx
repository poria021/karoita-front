'use client';

import { useWatch, type FieldValues, type Path, type UseFormReturn } from 'react-hook-form';
import dynamic from 'next/dynamic';

import { KvPasswordField } from '@/components/shared/fields/KvPasswordField';

const KvPasswordStrengthIndicator = dynamic(
  () =>
    import('@/components/shared/fields/KvPasswordStrengthIndicator').then(
      (mod) => ({ default: mod.KvPasswordStrengthIndicator })
    ),
  { ssr: false }
);

type PasswordPairValues = FieldValues & {
  newPassword: string;
  confirmPassword: string;
};

interface SecurityPasswordPairFieldsProps<TFieldValues extends PasswordPairValues> {
  form: UseFormReturn<TFieldValues>;
  disabled: boolean;
  confirmLabel?: string;
}

export function SecurityPasswordPairFields<TFieldValues extends PasswordPairValues>({
  form,
  disabled,
  confirmLabel = 'تکرار رمز عبور',
}: SecurityPasswordPairFieldsProps<TFieldValues>) {
  const newPasswordName = 'newPassword' as Path<TFieldValues>;
  const confirmPasswordName = 'confirmPassword' as Path<TFieldValues>;
  const watchedPassword = useWatch({
    control: form.control,
    name: newPasswordName,
  });

  return (
    <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2">
      <KvPasswordField
        label="رمز عبور جدید"
        required
        autoComplete="new-password"
        locked={disabled}
        error={
          typeof form.formState.errors.newPassword?.message === 'string'
            ? form.formState.errors.newPassword.message
            : undefined
        }
        footer={
          <KvPasswordStrengthIndicator password={String(watchedPassword ?? '')} />
        }
        {...form.register(newPasswordName)}
      />
      <KvPasswordField
        label={confirmLabel}
        required
        autoComplete="new-password"
        locked={disabled}
        error={
          typeof form.formState.errors.confirmPassword?.message === 'string'
            ? form.formState.errors.confirmPassword.message
            : undefined
        }
        {...form.register(confirmPasswordName)}
      />
    </div>
  );
}
