import type { UseFormRegisterReturn } from 'react-hook-form';

import { KvPasswordField } from '@/components/shared/fields/KvPasswordField';

interface PasswordFieldProps {
  id: string;
  label: string;
  registration: UseFormRegisterReturn<string>;
  errorMessage?: string;
  autoComplete?: string;
  /** Block browser vault inject until focus (login credential step). */
  suppressBrowserAutofill?: boolean;
  /** Controlled value when the parent owns the field via Controller. */
  value?: string;
}

/** Auth-form adapter around the shared {@link KvPasswordField}. */
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
