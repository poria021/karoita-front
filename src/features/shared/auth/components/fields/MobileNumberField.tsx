import type { UseFormRegisterReturn } from 'react-hook-form';

import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';

interface MobileNumberFieldProps {
  id: string;
  registration: UseFormRegisterReturn<'mobile'>;
  errorMessage?: string;
  disabled?: boolean;
  /** Seed English digits (e.g. remembered mobile). */
  defaultValue?: string;
  /** Override default label («شماره موبایل»). */
  label?: string;
  /**
   * Login uses `off` so the browser vault does not store Persian+English
   * duplicates; remembered mobile is handled by the app (English only).
   */
  autoComplete?: string;
}

/** Auth-form adapter around the shared {@link KvMobileNumberField}. */
export function MobileNumberField({
  id,
  registration,
  errorMessage,
  disabled,
  defaultValue,
  label,
  autoComplete,
}: MobileNumberFieldProps) {
  return (
    <KvMobileNumberField
      id={id}
      label={label}
      required
      locked={Boolean(disabled)}
      error={errorMessage}
      name={registration.name}
      defaultValue={defaultValue}
      autoComplete={autoComplete}
      onBlur={registration.onBlur}
      ref={registration.ref}
      onChange={registration.onChange}
    />
  );
}
