'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { CircleAlert, Info, Lock } from 'lucide-react';
import * as React from 'react';

import { KvInput } from '@/components/shared/KvInput';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';

export type KvTextFieldType = 'text' | 'email' | 'tel' | 'password' | 'number';
export type KvTextFieldSize = 'sm' | 'md' | 'lg';

const kvTextFieldWrapperVariants = cva(
  [
    'flex w-full items-center overflow-hidden rounded-xl border bg-white font-sans transition-colors',
    'focus-within:border-brand-500 focus-within:ring-[3px] focus-within:ring-brand-500/15',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'min-h-9',
        md: 'min-h-11',
        lg: 'min-h-12',
      },
      state: {
        default: 'border-slate-300',
        error:
          'border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-500/15',
        locked:
          'cursor-not-allowed border-slate-200 bg-slate-50 focus-within:border-slate-200 focus-within:ring-0',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  }
);

const kvTextFieldInputVariants = cva(
  [
    'h-auto w-full min-w-0 flex-1 rounded-none border-0 bg-transparent font-sans font-bold text-slate-800 shadow-none',
    'placeholder:text-slate-400',
    'focus-visible:border-0 focus-visible:ring-0',
    'disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-100',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'px-3 py-2 text-xs',
        md: 'px-3.5 py-2.5 text-xs',
        lg: 'px-4 py-3 text-sm',
      },
      state: {
        default: '',
        error: '',
        /** Match placeholder color when locked */
        locked: 'text-slate-400',
      },
      otpStyle: {
        true: 'text-center text-base font-black tracking-[0.5em]',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
      otpStyle: false,
    },
  }
);

type KvTextFieldState = NonNullable<
  VariantProps<typeof kvTextFieldWrapperVariants>['state']
>;

export type KvTextFieldProps = {
  /** Omit or pass `false` to hide label entirely */
  label?: string | false;
  required?: boolean;
  /** Shows muted "(اختیاری)" next to label when true */
  optionalHint?: boolean;
  type?: KvTextFieldType;
  size?: KvTextFieldSize;
  placeholder?: string;
  /** Error message under the field; also drives error border */
  error?: string;
  /** Helper / hint text (not error) — rendered with an info icon */
  hint?: string;
  /**
   * Locked = visually obvious disabled/read-only:
   * slate-50 bg, placeholder-colored text, lock icon beside the label
   */
  locked?: boolean;
  /**
   * When true (default if `locked`), shows a lock icon next to the label.
   * Never renders the lock inside the input.
   */
  showLockIcon?: boolean;
  dir?: 'rtl' | 'ltr' | 'auto';
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  /** Optional leading/trailing slot (e.g. +98, eye toggle) */
  startAddon?: React.ReactNode;
  endAddon?: React.ReactNode;
  /** OTP density: centered + wide tracking */
  otpStyle?: boolean;
  /** Extra content below the control (e.g. password strength) */
  footer?: React.ReactNode;
  /** @deprecated Forbidden — design-system consistency */
  className?: never;
};

/**
 * Karvita design-system text field.
 * Placeholder + locked value color: slate-400 (#94a3b8).
 */
export const KvTextField = React.forwardRef<HTMLInputElement, KvTextFieldProps>(
  function KvTextField(
    {
      label,
      required = false,
      optionalHint = false,
      type = 'text',
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
      onChange,
      onBlur,
      onFocus,
      autoComplete,
      inputMode,
      maxLength,
      startAddon,
      endAddon,
      otpStyle = false,
      footer,
    },
    ref
  ) {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const showLabel = label !== undefined && label !== false && label !== '';
    const state: KvTextFieldState = locked
      ? 'locked'
      : error
        ? 'error'
        : 'default';
    const showLabelLock = locked && showLockIcon !== false;
    const describedBy = error
      ? `${id}-error`
      : hint
        ? `${id}-hint`
        : undefined;

    return (
      <div className="w-full font-sans" data-slot="kv-text-field">
        {showLabel ? (
          <div className="mb-kv-field flex items-center gap-1.5" dir="rtl">
            {showLabelLock ? (
              <Lock
                className="size-3.5 shrink-0 text-slate-400"
                aria-hidden="true"
              />
            ) : null}
            <KvTypography variant="label" as="label" htmlFor={id}>
              {label}
              {required ? (
                <span className="ms-1 text-rose-500" aria-hidden="true">
                  *
                </span>
              ) : null}
              {optionalHint ? (
                <span className="ms-1 font-normal text-slate-400">
                  (اختیاری)
                </span>
              ) : null}
            </KvTypography>
          </div>
        ) : null}

        <div
          dir={dir}
          className={cn(kvTextFieldWrapperVariants({ size, state }))}
          data-locked={locked || undefined}
        >
          {startAddon ? (
            <div className="flex shrink-0 items-center self-stretch text-slate-400">
              {startAddon}
            </div>
          ) : null}

          <KvInput
            ref={ref}
            id={id}
            name={name}
            type={type}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            autoComplete={autoComplete}
            inputMode={inputMode}
            maxLength={maxLength}
            disabled={locked}
            readOnly={locked}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            className={cn(kvTextFieldInputVariants({ size, state, otpStyle }))}
          />

          {endAddon ? (
            <div className="flex shrink-0 items-center self-stretch">
              {endAddon}
            </div>
          ) : null}
        </div>

        {error ? (
          <div
            className="mt-kv-field flex items-start gap-1.5"
            id={`${id}-error`}
            role="alert"
          >
            <CircleAlert
              className="mt-0.5 size-3.5 shrink-0 text-rose-500"
              aria-hidden="true"
            />
            <KvTypography variant="error" tone="danger" as="span">
              {error}
            </KvTypography>
          </div>
        ) : hint ? (
          <div className="mt-kv-field flex items-start gap-1.5" id={`${id}-hint`}>
            <Info
              className="mt-0.5 size-3.5 shrink-0 text-slate-400"
              aria-hidden="true"
            />
            <KvTypography variant="caption" tone="muted" as="span">
              {hint}
            </KvTypography>
          </div>
        ) : null}

        {footer}
      </div>
    );
  }
);

KvTextField.displayName = 'KvTextField';

export {
  kvTextFieldWrapperVariants,
  kvTextFieldInputVariants,
};
