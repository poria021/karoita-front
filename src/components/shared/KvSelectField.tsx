'use client';

import * as React from 'react';

import { KvFieldFrame } from '@/components/shared/KvFieldFrame';
import {
  KvSelect,
  KvSelectContent,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/KvSelect';
import type { KvTextFieldSize } from '@/components/shared/KvTextField';
import { cn } from '@/lib/utils';

export type KvSelectFieldProps = {
  /**
   * Label text as a string, or `false` to hide.
   * Same contract as {@link KvTextField}.
   */
  label?: string | false;
  required?: boolean;
  optionalHint?: boolean;
  size?: KvTextFieldSize;
  placeholder?: string;
  error?: string;
  hint?: string;
  locked?: boolean;
  showLockIcon?: boolean;
  id?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
};

/**
 * Labeled select field — same chrome as {@link KvTextField}
 * (`label: string | false`, lock, error/hint, rounded-xl).
 */
export function KvSelectField({
  label,
  required = false,
  optionalHint = false,
  size = 'sm',
  placeholder,
  error,
  hint,
  locked = false,
  showLockIcon,
  id: idProp,
  value,
  onValueChange,
  disabled,
  children,
}: KvSelectFieldProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const isDisabled = locked || disabled;

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
      <KvSelect
        value={value || undefined}
        onValueChange={onValueChange}
        disabled={isDisabled}
      >
        <KvSelectTrigger
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={cn(
            size === 'sm' && 'min-h-9 px-3 py-2',
            size === 'md' && 'min-h-11 px-3.5 py-2.5',
            size === 'lg' && 'min-h-12 px-4 py-3',
            locked &&
              'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400',
            error && !locked && 'border-rose-300'
          )}
        >
          <KvSelectValue placeholder={placeholder} />
        </KvSelectTrigger>
        <KvSelectContent>{children}</KvSelectContent>
      </KvSelect>
    </KvFieldFrame>
  );
}
