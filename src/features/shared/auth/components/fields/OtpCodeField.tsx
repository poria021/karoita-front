'use client';

import * as React from 'react';
import type { ChangeEvent } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { KvTextField } from '@/components/shared/fields/KvTextField';
import {
  persianToEnglishDigits,
  toPersianDigits,
} from '@/utils/persianDigits';
import {
  LATIN_LETTERS_NOT_ALLOWED_MESSAGE,
  containsLatinLetters,
} from '@/utils/persianPersonName';

interface OtpCodeFieldProps {
  id: string;
  registration: UseFormRegisterReturn<'otp'>;
  value?: string;
  errorMessage?: string;
  locked?: boolean;
}

function filterDigits(rawValue: string): string {
  return persianToEnglishDigits(rawValue).replace(/\D/g, '');
}

export function OtpCodeField({
  id,
  registration,
  value,
  errorMessage,
  locked = false,
}: OtpCodeFieldProps) {
  const [localValue, setLocalValue] = React.useState(() =>
    filterDigits(value ?? '').slice(0, 5)
  );
  const [latinScriptError, setLatinScriptError] = React.useState<
    string | undefined
  >();
  const { name, onBlur, onChange, ref } = registration;

  const displayValue =
    value === undefined ? localValue : filterDigits(value).slice(0, 5);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (containsLatinLetters(raw)) {
      setLatinScriptError(LATIN_LETTERS_NOT_ALLOWED_MESSAGE);
    } else if (latinScriptError) {
      setLatinScriptError(undefined);
    }

    const next = filterDigits(raw).slice(0, 5);
    setLocalValue(next);
    event.target.value = next;
    void onChange(event);
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
        locked={locked}
        name={name}
        onBlur={onBlur}
        onChange={handleChange}
        ref={ref}
        value={toPersianDigits(displayValue)}
        scriptGuard="none"
        error={latinScriptError ?? errorMessage}
      />
    </div>
  );
}