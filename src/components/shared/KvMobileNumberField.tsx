'use client';

import * as React from 'react';
import type { ChangeEvent } from 'react';

import {
  KvTextField,
  type KvTextFieldSize,
} from '@/components/shared/KvTextField';
import {
  persianToEnglishDigits,
  toPersianDigits,
} from '@/utils/persianDigits';

/** English digits only — RHF / Zod / API. */
function filterDigits(rawValue: string): string {
  return persianToEnglishDigits(rawValue).replace(/\D/g, '');
}

const plus98Addon = (
  <span
    className="flex h-full items-center gap-2 ps-3.5 text-xs font-bold leading-none text-kv-text-faint select-none"
    aria-hidden="true"
  >
    <span>+{toPersianDigits('98')}</span>
    <span className="text-kv-border-strong" aria-hidden="true">
      |
    </span>
  </span>
);

export type KvMobileNumberFieldProps = {
  id?: string;
  label?: string | false;
  required?: boolean;
  error?: string;
  locked?: boolean;
  showLockIcon?: boolean;
  size?: KvTextFieldSize;
  /** English or Persian digits — always shown as Persian; stored/emitted as English. */
  value?: string;
  defaultValue?: string;
  name?: string;
  autoComplete?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
};

/**
 * Shared +98 mobile field — same control for auth forms and profile.
 * UI shows Persian digits; `onChange` / RHF always receive English `0-9`.
 */
export const KvMobileNumberField = React.forwardRef<
  HTMLInputElement,
  KvMobileNumberFieldProps
>(function KvMobileNumberField(
  {
    id,
    label = 'شماره موبایل',
    required = false,
    error,
    locked = false,
    showLockIcon,
    size = 'md',
    value,
    defaultValue,
    name,
    autoComplete = 'tel-national',
    onChange,
    onBlur,
    onFocus,
  },
  ref
) {
  const isControlled = value !== undefined;
  const [uncontrolledEnglish, setUncontrolledEnglish] = React.useState(() =>
    filterDigits(defaultValue ?? '').slice(0, 10)
  );

  const englishValue = (
    isControlled ? filterDigits(value ?? '') : uncontrolledEnglish
  ).slice(0, 10);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (locked) {
      onChange?.(event);
      return;
    }

    const next = filterDigits(event.target.value).slice(0, 10);
    if (!isControlled) {
      setUncontrolledEnglish(next);
    }

    // Emit English digits so register/Zod/API stay ASCII.
    event.target.value = next;
    onChange?.(event);
  };

  return (
    <KvTextField
      id={id}
      ref={ref}
      label={label}
      required={required}
      type="tel"
      size={size}
      dir="ltr"
      inputMode="numeric"
      autoComplete={autoComplete}
      maxLength={10}
      placeholder={toPersianDigits('9123456789')}
      locked={locked}
      showLockIcon={showLockIcon}
      value={toPersianDigits(englishValue)}
      name={name}
      onBlur={onBlur}
      onFocus={onFocus}
      onChange={handleChange}
      error={error}
      startAddon={plus98Addon}
    />
  );
});

KvMobileNumberField.displayName = 'KvMobileNumberField';
