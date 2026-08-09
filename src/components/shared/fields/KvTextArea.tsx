'use client';

import { cva } from 'class-variance-authority';
import * as React from 'react';

import { KvFieldFrame } from '@/components/shared/fields/KvFieldFrame';
import {
  type KvTextFieldSize,
  type PersianTextScriptGuard,
} from '@/components/shared/fields/KvTextField';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  LATIN_LETTERS_NOT_ALLOWED_MESSAGE,
  applyPersianTextScriptGuard,
} from '@/utils/persianPersonName';

const kvTextAreaVariants = cva(
  [
    'w-full resize-y rounded-kv-control border bg-kv-field font-sans font-bold text-kv-text-secondary shadow-none',
    'placeholder:text-kv-text-placeholder',
    'transition-[color,background-color,border-color,box-shadow]',
    'focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-100',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'min-h-20 px-3 py-2 text-xs',
        md: 'min-h-24 px-3.5 py-2.5 text-xs',
        lg: 'min-h-28 px-4 py-3 text-sm',
      },
      state: {
        default: [
          'border-kv-border',
          'focus-visible:border-kv-brand focus-visible:bg-kv-field',
          'focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
        ].join(' '),
        error: [
          'border-kv-danger-border',
          'focus-visible:border-kv-danger focus-visible:bg-kv-field',
          'focus-visible:ring-[3px] focus-visible:ring-kv-ring-danger/15',
        ].join(' '),
        locked: [
          'cursor-not-allowed border-kv-border-disabled bg-kv-field-disabled text-kv-text-disabled',
          'focus-visible:border-kv-border-disabled focus-visible:ring-0',
        ].join(' '),
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  }
);

export type KvTextAreaProps = {
  label?: string | false;
  required?: boolean;
  optionalHint?: boolean;
  size?: KvTextFieldSize;
  placeholder?: string;
  error?: string;
  hint?: string;
  locked?: boolean;
  showLockIcon?: boolean;
  dir?: 'rtl' | 'ltr' | 'auto';
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  rows?: number;
  maxLength?: number;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  /** پیش‌فرض no-latin؛ برای متن آزاد انگلیسی `none` بگذارید. */
  scriptGuard?: PersianTextScriptGuard;
  className?: never;
};

export const KvTextArea = React.forwardRef<
  HTMLTextAreaElement,
  KvTextAreaProps
>(function KvTextArea(
  {
    label,
    required = false,
    optionalHint = false,
    size = 'md',
    placeholder,
    error,
    hint,
    locked = false,
    showLockIcon,
    dir,
    id: idProp,
    name,
    value,
    defaultValue,
    rows = 4,
    maxLength,
    onChange,
    onBlur,
    onFocus,
    scriptGuard = 'no-latin',
  },
  ref
) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const [latinScriptError, setLatinScriptError] = React.useState<
    string | undefined
  >();
  const displayError = latinScriptError ?? error;
  const state = locked ? 'locked' : displayError ? 'error' : 'default';
  const describedBy = displayError
    ? `${id}-error`
    : hint && !latinScriptError
      ? `${id}-hint`
      : undefined;

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (locked || scriptGuard === 'none') {
      onChange?.(event);
      return;
    }

    const raw = event.target.value;
    const { value: next, blockedLatin } = applyPersianTextScriptGuard(
      raw,
      scriptGuard
    );
    if (blockedLatin) {
      event.target.value = next;
      setLatinScriptError(LATIN_LETTERS_NOT_ALLOWED_MESSAGE);
    } else if (next !== raw) {
      event.target.value = next;
      if (latinScriptError) {
        setLatinScriptError(undefined);
      }
    } else if (latinScriptError) {
      setLatinScriptError(undefined);
    }

    onChange?.(event);
  };

  return (
    <KvFieldFrame
      id={id}
      label={label}
      required={required}
      optionalHint={optionalHint}
      locked={locked}
      showLockIcon={showLockIcon}
      error={displayError}
      hint={latinScriptError ? undefined : hint}
    >
      <Textarea
        ref={ref}
        id={id}
        name={name}
        dir={dir}
        rows={rows}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={locked}
        readOnly={locked}
        aria-invalid={displayError ? true : undefined}
        aria-describedby={describedBy}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        data-slot="kv-text-area"
        data-locked={locked || undefined}
        className={cn(kvTextAreaVariants({ size, state }))}
      />
    </KvFieldFrame>
  );
});

KvTextArea.displayName = 'KvTextArea';
