import type { UseFormRegisterReturn } from 'react-hook-form';

import { KvMobileNumberField } from '@/components/shared/KvMobileNumberField';

interface MobileNumberFieldProps {
  id: string;
  registration: UseFormRegisterReturn<'mobile'>;
  errorMessage?: string;
  disabled?: boolean;
}

/** Auth-form adapter around the shared {@link KvMobileNumberField}. */
export function MobileNumberField({
  id,
  registration,
  errorMessage,
  disabled,
}: MobileNumberFieldProps) {
  return (
    <KvMobileNumberField
      id={id}
      required
      locked={Boolean(disabled)}
      error={errorMessage}
      name={registration.name}
      onBlur={registration.onBlur}
      ref={registration.ref}
      onChange={registration.onChange}
    />
  );
}
