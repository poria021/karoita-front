'use client';

import * as React from 'react';
import type { ChangeEvent } from 'react';

import {
  KvTextField,
  type KvTextFieldSize,
} from '@/components/shared/KvTextField';
import { persianToEnglishDigits } from '@/utils/persianDigits';

function filterDigits(rawValue: string): string {
  return persianToEnglishDigits(rawValue).replace(/\D/g, '');
}

const plus98Addon = (
  <span className="flex h-full items-center border-e border-slate-200/70 bg-slate-100/60 px-3 text-xs font-semibold text-slate-400">
    +98
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

/**
 * Shared +98 mobile field — same control for auth forms and profile.
 * Digits-only when editable; lock/read-only when `locked`.
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
    size = 'sm',
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
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!locked) {
      event.target.value = filterDigits(event.target.value);
    }
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
      placeholder="9123456789"
      locked={locked}
      showLockIcon={showLockIcon}
      value={value}
      defaultValue={defaultValue}
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
