'use client';

import * as React from 'react';
import type { ChangeEvent } from 'react';

import {
  KvTextField,
  type KvTextFieldSize,
} from '@/components/shared/fields/KvTextField';
import {
  persianToEnglishDigits,
  toPersianDigits,
} from '@/utils/persianDigits';

function filterDigits(rawValue: string): string {
  return persianToEnglishDigits(rawValue).replace(/\D/g, '');
}

const plus98Addon = (
  <span
    className="flex h-full items-center gap-kv-pair ps-3.5 text-xs font-bold leading-none text-kv-text-faint select-none"
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
  value?: string;
  defaultValue?: string;
  name?: string;
  autoComplete?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
};

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
