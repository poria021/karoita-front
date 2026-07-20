import type { UseFormRegisterReturn } from 'react-hook-form';

import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';

interface MobileNumberFieldProps {
  id: string;
  registration: UseFormRegisterReturn<'mobile'>;
  errorMessage?: string;
  disabled?: boolean;
  defaultValue?: string;
  label?: string;
  autoComplete?: string;
}

export function MobileNumberField({
  id,
  registration,
  errorMessage,
  disabled,
  defaultValue,
  label,
  autoComplete,
}: MobileNumberFieldProps) {
  const { name, onBlur, onChange, ref } = registration;

  return (
    <KvMobileNumberField
      id={id}
      label={label}
      required
      locked={Boolean(disabled)}
      error={errorMessage}
      name={name}
      defaultValue={defaultValue}
      autoComplete={autoComplete}
      onBlur={onBlur}
      ref={ref}
      onChange={onChange}
    />
  );
}
