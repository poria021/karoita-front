import type { UseFormRegisterReturn } from 'react-hook-form';

import { KvPasswordField } from '@/components/shared/fields/KvPasswordField';

interface PasswordFieldProps {
  id: string;
  label: string;
  registration: UseFormRegisterReturn<string>;
  errorMessage?: string;
  autoComplete?: string;
}

/** Auth-form adapter around the shared {@link KvPasswordField}. */
export function PasswordField({
  id,
  label,
  registration,
  errorMessage,
  autoComplete = 'current-password',
}: PasswordFieldProps) {
  return (
    <KvPasswordField
      id={id}
      label={label}
      required
      autoComplete={autoComplete}
      error={errorMessage}
      name={registration.name}
      onBlur={registration.onBlur}
      onChange={registration.onChange}
      ref={registration.ref}
    />
  );
}
