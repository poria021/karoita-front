'use client';

import * as React from 'react';
import type { ChangeEvent } from 'react';

import {
  KvTextField,
  type KvTextFieldSize,
} from '@/components/shared/fields/KvTextField';
import { toPersianDigits } from '@/utils/persianDigits';
import {
  IRAN_MOBILE_PREFIX_MESSAGE,
  hasInvalidIranMobilePrefix,
  sanitizeIranMobileNationalInput,
} from '@/utils/iranMobileField';
import {
  LATIN_LETTERS_NOT_ALLOWED_MESSAGE,
  containsLatinLetters,
} from '@/utils/persianPersonName';
import { cn } from '@/lib/utils';

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
    sanitizeIranMobileNationalInput(defaultValue ?? '')
  );
  const [latinScriptError, setLatinScriptError] = React.useState<
    string | undefined
  >();
  const [prefixError, setPrefixError] = React.useState<string | undefined>();

  const englishValue = isControlled
    ? sanitizeIranMobileNationalInput(value ?? '')
    : uncontrolledEnglish;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (locked) {
      onChange?.(event);
      return;
    }

    const input = event.target;
    const cursorPos = input.selectionStart ?? input.value.length;
    const raw = input.value;
    if (containsLatinLetters(raw)) {
      setLatinScriptError(LATIN_LETTERS_NOT_ALLOWED_MESSAGE);
    } else if (latinScriptError) {
      setLatinScriptError(undefined);
    }

    if (hasInvalidIranMobilePrefix(raw)) {
      setPrefixError(IRAN_MOBILE_PREFIX_MESSAGE);
    } else if (prefixError) {
      setPrefixError(undefined);
    }

    const next = sanitizeIranMobileNationalInput(raw);
    if (!isControlled) {
      setUncontrolledEnglish(next);
    }

    // چون طول رشته ممکن است کم شود (حذف صفر اول)، مکان‌نما را متناسب
    // با تعداد کاراکترهای حذف‌شده جابه‌جا می‌کنیم، نه اینکه به انتها بپرد.
    const removedChars = raw.length - next.length;
    const nextCursor = Math.max(0, Math.min(next.length, cursorPos - removedChars));

    input.value = next;
    onChange?.(event);

    const displayValue = toPersianDigits(next);
    input.value = displayValue;
    input.setSelectionRange(nextCursor, nextCursor);
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
      error={latinScriptError ?? prefixError ?? error}
      startAddon={buildPlus98Addon(locked)}
    />
  );
});

KvMobileNumberField.displayName = 'KvMobileNumberField';
