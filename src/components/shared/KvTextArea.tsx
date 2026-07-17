'use client';

import { cva } from 'class-variance-authority';
import * as React from 'react';

import { KvFieldFrame } from '@/components/shared/KvFieldFrame';
import {
  type KvTextFieldSize,
} from '@/components/shared/KvTextField';
import { cn } from '@/lib/utils';

const kvTextAreaVariants = cva(
  [
    'w-full resize-y rounded-xl border bg-white font-sans font-bold text-slate-800 shadow-none transition-colors',
    'placeholder:text-slate-400',
    'focus-visible:border-brand-500 focus-visible:ring-[3px] focus-visible:ring-brand-500/15 focus-visible:outline-none',
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
        default: 'border-slate-300',
        error:
          'border-rose-300 focus-visible:border-rose-400 focus-visible:ring-rose-500/15',
        locked:
          'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 focus-visible:border-slate-200 focus-visible:ring-0',
      },
    },
    defaultVariants: {
      size: 'sm',
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
  /** @deprecated Forbidden — design-system consistency */
  className?: never;
};

/**
 * Multiline field with the same chrome as {@link KvTextField}
 * (label spacing, lock, error/hint). Not an input `type` — separate element.
 */
export const KvTextArea = React.forwardRef<
  HTMLTextAreaElement,
  KvTextAreaProps
>(function KvTextArea(
  {
    label,
    required = false,
    optionalHint = false,
    size = 'sm',
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
  },
  ref
) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const state = locked ? 'locked' : error ? 'error' : 'default';
  const describedBy = error
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined;

  return (
    <KvFieldFrame
      id={id}
      label={label}
      required={required}
      optionalHint={optionalHint}
      locked={locked}
      showLockIcon={showLockIcon}
      error={error}
      hint={hint}
    >
      <textarea
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
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={onChange}
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
