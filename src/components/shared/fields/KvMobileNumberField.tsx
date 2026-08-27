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
import {
  LATIN_LETTERS_NOT_ALLOWED_MESSAGE,
  containsLatinLetters,
} from '@/utils/persianPersonName';
import { cn } from '@/lib/utils';

function filterDigits(rawValue: string): string {
  return persianToEnglishDigits(rawValue).replace(/\D/g, '');
}

/**
 * پیشوند «۹۸+» — رنگ متن باید در حالت قفل، هم‌رنگ سایر متن‌های قفل‌شده
 * (text-kv-text-disabled) باشد؛ در حالت عادی رنگ پیش‌فرض همان
 * text-kv-text-secondary می‌ماند.
 */
function buildPlus98Addon(locked: boolean) {
  return (
    <span
      className={cn(
        'flex h-full items-center gap-kv-pair ps-3.5 text-xs font-bold leading-none select-none',
        locked ? 'text-kv-text-disabled' : 'text-kv-text-secondary'
      )}
      aria-hidden="true"
    >
      <span>+{toPersianDigits('98')}</span>
      <span
        className={locked ? 'text-kv-border-disabled' : 'text-kv-border-strong'}
        aria-hidden="true"
      >
        |
      </span>
    </span>
  );
}

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
  const [latinScriptError, setLatinScriptError] = React.useState<
    string | undefined
  >();

  const englishValue = (
    isControlled ? filterDigits(value ?? '') : uncontrolledEnglish
  ).slice(0, 10);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (locked) {
      onChange?.(event);
      return;
    }

    const raw = event.target.value;
    if (containsLatinLetters(raw)) {
      setLatinScriptError(LATIN_LETTERS_NOT_ALLOWED_MESSAGE);
    } else if (latinScriptError) {
      setLatinScriptError(undefined);
    }

    const next = filterDigits(raw).slice(0, 10);
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
      scriptGuard="none"
      error={latinScriptError ?? error}
      startAddon={buildPlus98Addon(locked)}
    />
  );
});

KvMobileNumberField.displayName = 'KvMobileNumberField';
