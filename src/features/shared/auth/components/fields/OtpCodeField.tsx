import type { UseFormRegisterReturn } from 'react-hook-form';

import { KvTextField } from '@/components/shared/KvTextField';

interface OtpCodeFieldProps {
  id: string;
  registration: UseFormRegisterReturn<'otp'>;
  errorMessage?: string;
}

/** Centered, widely-tracked 5-digit SMS verification code input. */
export function OtpCodeField({
  id,
  registration,
  errorMessage,
}: OtpCodeFieldProps) {
  return (
    <div>
      <KvTextField
        id={id}
        label="کد تایید ۵ رقمی"
        required
        type="tel"
        size="sm"
        dir="ltr"
        inputMode="numeric"
        maxLength={5}
        placeholder="• • • • •"
        otpStyle
        name={registration.name}
        onBlur={registration.onBlur}
        onChange={registration.onChange}
        ref={registration.ref}
        error={errorMessage}
      />
    </div>
  );
}
