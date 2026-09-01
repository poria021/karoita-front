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
  contentClassName?: string;
  triggerClassName?: string;
  /** برچسب تریگر بسته (مثلاً رقم فارسی) تا `value` انگلیسی به UI نشت نکند. */
  displayValue?: React.ReactNode;
  children: React.ReactNode;
};

const SIZE_CLASS: Record<KvTextFieldSize, string> = {
  sm: 'h-11 px-3.5 data-[size=default]:h-11',
  md: 'h-11 px-3.5 data-[size=default]:h-11',
  lg: 'h-11 px-3.5 data-[size=default]:h-11',
};

export const KvSelectField = React.forwardRef<
  HTMLButtonElement,
  KvSelectFieldProps
>(function KvSelectField(
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
    id: idProp,
    value,
    onValueChange,
    disabled,
    contentClassName,
    triggerClassName,
    displayValue,
    children,
  },
  ref
) {
  const rawId = React.useId();
  const generatedId = `kv${rawId.replace(/:/g, '')}`;
  const id = idProp ?? generatedId;
  const labelId = `${id}-label`;
  const triggerId = id;
  const isDisabled = locked || disabled;

  return (
    <KvFieldFrame
      id={labelId}
      fieldId={triggerId}
      label={label}
      required={required}
      optionalHint={optionalHint}
      locked={locked}
      showLockIcon={showLockIcon}
      error={error}
      hint={hint}
    >
      <KvSelect
        // خالیِ کنترل‌شده را `''` بگذار — با `value || undefined` coerce نکن.
        value={value}
        onValueChange={onValueChange}
        disabled={isDisabled}
      >
        <KvSelectTrigger
          ref={ref}
          id={triggerId}
          aria-labelledby={labelId}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={cn(
            SIZE_CLASS[size],
            locked &&
              'cursor-not-allowed border-kv-border-disabled bg-kv-field-disabled text-kv-text-disabled',
            error &&
              !locked &&
              [
                'border-kv-danger-border',
                'focus-visible:border-kv-danger focus-visible:ring-kv-ring-danger/15',
                'data-[state=open]:border-kv-danger data-[state=open]:ring-kv-ring-danger/15',
              ].join(' '),
            triggerClassName
          )}
        >
          {displayValue != null && displayValue !== '' ? (
            <KvSelectValue placeholder={placeholder}>
              {displayValue}
            </KvSelectValue>
          ) : (
            <KvSelectValue placeholder={placeholder} />
          )}
        </KvSelectTrigger>
        <KvSelectContent className={contentClassName}>{children}</KvSelectContent>
      </KvSelect>
    </KvFieldFrame>
  );
});

KvSelectField.displayName = 'KvSelectField';
