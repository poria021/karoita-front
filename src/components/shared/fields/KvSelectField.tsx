'use client';

import * as React from 'react';

import { KvFieldFrame } from '@/components/shared/fields/KvFieldFrame';
import {
  KvSelect,
  KvSelectContent,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/fields/KvSelect';
import type { KvTextFieldSize } from '@/components/shared/fields/KvTextField';
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
  /** Passed to portaled {@link KvSelectContent} (e.g. `z-[150]` inside dialogs). */
  contentClassName?: string;
  children: React.ReactNode;
};

const SIZE_CLASS: Record<KvTextFieldSize, string> = {
  sm: 'h-9 px-3 data-[size=default]:h-9',
  md: 'h-11 px-3.5 data-[size=default]:h-11',
  lg: 'h-12 px-4 data-[size=default]:h-12',
};

/**
 * Labeled select field — same chrome as {@link KvTextField}
 * (`label: string | false`, size scale, lock, error/hint, full-width control).
 */
export function KvSelectField({
  label,
  required = false,
  optionalHint = false,
  size = 'md',
  placeholder,
  error,
  hint,
  locked = false,
  showLockIcon,
  id: idProp,
  value,
  onValueChange,
  disabled,
  contentClassName,
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
            SIZE_CLASS[size],
            locked &&
              'cursor-not-allowed border-kv-border-disabled bg-kv-field-disabled text-kv-text-disabled hover:border-kv-border-disabled hover:bg-kv-field-disabled',
            error &&
              !locked &&
              [
                'border-kv-danger-border',
                'hover:border-kv-danger-border hover:bg-kv-danger-border/20',
                'focus-visible:border-kv-danger focus-visible:hover:border-kv-danger',
                'focus-visible:hover:bg-kv-surface focus-visible:ring-kv-ring-danger/15',
                'data-[state=open]:border-kv-danger data-[state=open]:hover:border-kv-danger',
                'data-[state=open]:hover:bg-kv-surface data-[state=open]:ring-kv-ring-danger/15',
              ].join(' ')
          )}
        >
          <KvSelectValue placeholder={placeholder} />
        </KvSelectTrigger>
        <KvSelectContent className={contentClassName}>{children}</KvSelectContent>
      </KvSelect>
    </KvFieldFrame>
  );
}
