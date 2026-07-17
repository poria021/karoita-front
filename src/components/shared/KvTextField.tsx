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
      size: 'sm',
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
        locked: 'text-slate-400',
      },
      otpStyle: {
        true: 'text-center text-base font-black tracking-[0.5em]',
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
      </KvFieldFrame>
    );
  }
);

KvTextField.displayName = 'KvTextField';

export {
  kvTextFieldWrapperVariants,
  kvTextFieldInputVariants,
};
