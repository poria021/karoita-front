import type { UseFormRegisterReturn } from 'react-hook-form';

import { KvPasswordField } from '@/components/shared/fields/KvPasswordField';

interface PasswordFieldProps {
  id: string;
  label: string;
  registration: UseFormRegisterReturn<string>;
  errorMessage?: string;
  autoComplete?: string;
  suppressBrowserAutofill?: boolean;
  value?: string;
}

export function PasswordField({
  id,
  label,
  registration,
  errorMessage,
  autoComplete = 'current-password',
  suppressBrowserAutofill = false,
  value,
}: PasswordFieldProps) {
  const { name, onBlur, onChange, ref } = registration;
  const isControlled = value !== undefined;

  return (
    <KvPasswordField
      id={id}
      label={label}
      required
      autoComplete={autoComplete}
      suppressBrowserAutofill={suppressBrowserAutofill}
      error={errorMessage}
      name={name}
      value={isControlled ? value : undefined}
      onBlur={onBlur}
      onChange={onChange}
      ref={ref}
    />
  );
}
