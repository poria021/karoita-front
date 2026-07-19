'use client';

import * as React from 'react';
import type { ChangeEvent } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { KvTextField } from '@/components/shared/fields/KvTextField';
import {
  persianToEnglishDigits,
  toPersianDigits,
} from '@/utils/persianDigits';

interface OtpCodeFieldProps {
  id: string;
  registration: UseFormRegisterReturn<'otp'>;
  errorMessage?: string;
}

function filterDigits(rawValue: string): string {
  return persianToEnglishDigits(rawValue).replace(/\D/g, '');
}

/** Centered 5-digit SMS code — Persian on screen, English in RHF. */
export function OtpCodeField({
  id,
  registration,
  errorMessage,
}: OtpCodeFieldProps) {
  const [englishValue, setEnglishValue] = React.useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = filterDigits(event.target.value).slice(0, 5);
    setEnglishValue(next);
    event.target.value = next;
    void registration.onChange(event);
  };

  return (
    <div>
      <KvTextField
        id={id}
        label="کد تایید ۵ رقمی"
        required
        type="tel"
        dir="ltr"
        autoComplete="one-time-code"
        inputMode="numeric"
        maxLength={5}
        placeholder="• • • • •"
        otpStyle
        name={registration.name}
        onBlur={registration.onBlur}
        onChange={handleChange}
        ref={registration.ref}
        value={toPersianDigits(englishValue)}
        error={errorMessage}
      />
    </div>
  );
}
