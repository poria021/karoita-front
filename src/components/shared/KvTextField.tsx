'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { KvFieldFrame } from '@/components/shared/KvFieldFrame';
import { KvInput } from '@/components/shared/KvInput';
import { cn } from '@/lib/utils';

/** HTML input types only — domain presets (mobile, password UI) are separate components. */
export type KvTextFieldType = 'text' | 'email' | 'tel' | 'password' | 'number';
export type KvTextFieldSize = 'sm' | 'md' | 'lg';

const kvTextFieldWrapperVariants = cva(
  [
    'flex w-full items-stretch overflow-hidden rounded-kv-control border bg-kv-surface font-sans transition-colors',
    'focus-within:border-kv-brand focus-within:ring-[3px] focus-within:ring-kv-ring/15',
  ].join(' '),
  {
    variants: {
      size: {
        /** Fixed heights so text / select / locked shells stay aligned in grids */
        sm: 'h-9',
        md: 'h-11',
        lg: 'h-12',
      },
      state: {
        default: 'border-kv-border-strong',
        error:
          'border-kv-danger-border focus-within:border-kv-danger focus-within:ring-kv-ring-danger/15',
        locked:
          'cursor-not-allowed border-kv-border-strong bg-kv-surface-muted focus-within:border-kv-border-strong focus-within:ring-0',
      },
    },
    defaultVariants: {
      size: 'sm',
      state: 'default',
    },
  }
);

const kvTextFieldInputVariants = cva(
  [
    'h-full w-full min-w-0 flex-1 rounded-none border-0 bg-transparent font-sans font-bold text-kv-text-secondary shadow-none',
    'text-xs leading-none md:text-xs',
    'placeholder:text-kv-text-faint',
    'focus-visible:border-0 focus-visible:ring-0',
    'disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-100',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'px-3',
        md: 'px-3.5',
        lg: 'px-4',
      },
      state: {
        default: '',
        error: '',
        locked: 'text-kv-text-faint',
      },
      otpStyle: {
        true: 'text-center text-base font-black tracking-[0.5em] leading-normal',
        false: '',
      },
    },
    defaultVariants: {
      size: 'sm',
      state: 'default',
      otpStyle: false,
    },
  }
);

type KvTextFieldState = NonNullable<
  VariantProps<typeof kvTextFieldWrapperVariants>['state']
>;

export type KvTextFieldProps = {
  /**
   * Label text as a string, or `false` to hide the label entirely.
   * Pass the Persian/English copy here — do not render a separate `<label>`.
   */
  label?: string | false;
  required?: boolean;
  optionalHint?: boolean;
  type?: KvTextFieldType;
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
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  startAddon?: React.ReactNode;
  endAddon?: React.ReactNode;
  /** OTP density: centered + wide tracking */
  otpStyle?: boolean;
  footer?: React.ReactNode;
  /** @deprecated Forbidden — design-system consistency */
  className?: never;
};

/**
 * Single-line field shell (label, size, lock, error/hint, addons).
 * Domain presets: {@link KvMobileNumberField}, {@link KvPasswordField}.
 * Multiline: {@link KvTextArea}.
 */
export const KvTextField = React.forwardRef<HTMLInputElement, KvTextFieldProps>(
  function KvTextField(
    {
      label,
      required = false,
      optionalHint = false,
      type = 'text',
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
    const state: KvTextFieldState = locked
      ? 'locked'
      : error
        ? 'error'
        : 'default';
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
        footer={footer}
      >
        <div
          dir={dir}
          className={cn(kvTextFieldWrapperVariants({ size, state }))}
          data-slot="kv-text-field"
          data-locked={locked || undefined}
        >
          {startAddon ? (
            <div className="flex h-full shrink-0 items-center text-kv-text-faint">
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
            className={cn(
              'h-full min-h-0',
              kvTextFieldInputVariants({ size, state, otpStyle }),
              startAddon && 'ps-1.5',
              endAddon && 'pe-1.5'
            )}
          />

          {endAddon ? (
            <div className="flex h-full shrink-0 items-center">
              {endAddon}
            </div>
          ) : null}
        </div>
      </KvFieldFrame>
    );
  }
);

KvTextField.displayName = 'KvTextField';

export {
  kvTextFieldWrapperVariants,
  kvTextFieldInputVariants,
};
