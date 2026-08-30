'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { KvFieldFrame } from '@/components/shared/fields/KvFieldFrame';
import { KvInput } from '@/components/shared/fields/KvInput';
import { cn } from '@/lib/utils';
import {
  LATIN_LETTERS_NOT_ALLOWED_MESSAGE,
  applyPersianTextScriptGuard,
  type PersianTextScriptGuard,
} from '@/utils/persianPersonName';

export type KvTextFieldType = 'text' | 'email' | 'tel' | 'password' | 'number';
export type KvTextFieldSize = 'sm' | 'md' | 'lg';
export type { PersianTextScriptGuard };

const kvTextFieldWrapperVariants = cva(
  [
    'flex w-full items-stretch overflow-hidden rounded-kv-control border bg-kv-field font-sans',
    'transition-[color,background-color,border-color,box-shadow]',
  ].join(' '),
  {
    variants: {
      size: {
        /* Product control height is locked to 44px (rule 80 md) for all sizes. */
        sm: 'h-11',
        md: 'h-11',
        lg: 'h-11',
      },
      state: {
        default: [
          'border-kv-border can-hover:hover:border-kv-border-hover',
          'focus-within:border-kv-brand focus-within:bg-kv-field',
          'focus-within:ring-[3px] focus-within:ring-kv-ring/15',
        ].join(' '),
        error: [
          'border-kv-danger-border hover:border-kv-danger-border',
          'focus-within:border-kv-danger focus-within:bg-kv-field',
          'focus-within:ring-[3px] focus-within:ring-kv-ring-danger/15',
        ].join(' '),
        locked: [
          'cursor-not-allowed border-kv-border-disabled bg-kv-field-disabled',
          'focus-within:border-kv-border-disabled focus-within:ring-0',
        ].join(' '),
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
    'h-full w-full min-w-0 flex-1 rounded-none border-0 bg-transparent font-sans font-bold text-kv-text-secondary shadow-none',
    'leading-none',
    'placeholder:text-kv-text-placeholder',
    'focus-visible:border-0 focus-visible:ring-0',
    'aria-invalid:border-0 aria-invalid:ring-0',
    'disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-100',
  ].join(' '),
  {
    variants: {
      size: {
        /* Padding + type locked with control height (md). */
        sm: 'px-3.5 text-xs md:text-xs',
        md: 'px-3.5 text-xs md:text-xs',
        lg: 'px-3.5 text-xs md:text-xs',
      },
      state: {
        default: '',
        error: '',
        locked: 'text-kv-text-disabled',
      },
      otpStyle: {
        true: 'text-center text-base font-black tracking-[0.5em] leading-normal',
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

function resolveScriptGuard(options: {
  scriptGuard: PersianTextScriptGuard | 'auto';
  type: KvTextFieldType;
  otpStyle: boolean;
  emphasis?: 'metric';
}): PersianTextScriptGuard {
  if (options.scriptGuard !== 'auto') {
    return options.scriptGuard;
  }
  if (
    options.otpStyle ||
    options.emphasis === 'metric' ||
    options.type !== 'text'
  ) {
    return 'none';
  }
  return 'no-latin';
}

export type KvTextFieldProps = {
  label?: string | false;
  required?: boolean;
  optionalHint?: boolean;
  type?: KvTextFieldType;
  size?: KvTextFieldSize;
  placeholder?: string;
  error?: string;
  hint?: string;
  locked?: boolean;
  readOnly?: boolean;
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
  startIcon?: React.ReactNode;
  endAddon?: React.ReactNode;
  otpStyle?: boolean;
  /** عدد متریک ادمین — کمی درشت‌تر، وسط‌چین، بدون اسکیل نمایشی افراطی */
  emphasis?: 'metric';
  /**
   * نگهبان حروف لاتین (مثل KvPasswordField ولی برعکس).
   * `auto`: برای type=text → no-latin؛ سرچ/رمز/عددی باید `none` بگذارند.
   */
  scriptGuard?: PersianTextScriptGuard | 'auto';
  footer?: React.ReactNode;
  autoFocus?: boolean;
  className?: never;
};

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
      readOnly = false,
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
      autoFocus,
      inputMode,
      maxLength,
      startAddon,
      startIcon,
      endAddon,
      otpStyle = false,
      emphasis,
      scriptGuard = 'auto',
      footer,
    },
    ref
  ) {
    const rawId = React.useId();
    const generatedId = `kv${rawId.replace(/:/g, '')}`;
    const id = idProp ?? generatedId;
    const [latinScriptError, setLatinScriptError] = React.useState<
      string | undefined
    >();
    const resolvedGuard = resolveScriptGuard({
      scriptGuard,
      type,
      otpStyle,
      emphasis,
    });
    const displayError = latinScriptError ?? error;
    const state: KvTextFieldState = locked
      ? 'locked'
      : displayError
        ? 'error'
        : 'default';
    const describedBy = displayError
      ? `${id}-error`
      : hint && !latinScriptError
        ? `${id}-hint`
        : undefined;
    const resolvedStartAddon =
      startAddon ??
      (startIcon ? (
        <span className="flex h-full items-center ps-1.5">{startIcon}</span>
      ) : null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (locked || readOnly || resolvedGuard === 'none') {
        onChange?.(event);
        return;
      }

      const raw = event.target.value;
      const { value: next, blockedLatin } = applyPersianTextScriptGuard(
        raw,
        resolvedGuard
      );
      if (blockedLatin) {
        event.target.value = next;
        setLatinScriptError(LATIN_LETTERS_NOT_ALLOWED_MESSAGE);
      } else if (resolvedGuard === 'persian-name' && next !== raw) {
        event.target.value = next;
        if (latinScriptError) {
          setLatinScriptError(undefined);
        }
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
        footer={footer}
      >
        <div
          dir={dir}
          className={cn(
            kvTextFieldWrapperVariants({ size, state }),
            emphasis === 'metric' && 'h-12'
          )}
          data-slot="kv-text-field"
          data-locked={locked || undefined}
        >
          {resolvedStartAddon ? (
            <div className="flex h-full shrink-0 items-center text-kv-text-placeholder">
              {resolvedStartAddon}
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
            autoFocus={autoFocus}
            inputMode={inputMode}
            maxLength={maxLength}
            disabled={locked}
            readOnly={locked || readOnly}
            aria-invalid={displayError ? true : undefined}
            aria-describedby={describedBy}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            className={cn(
              'h-full min-h-0',
              kvTextFieldInputVariants({ size, state, otpStyle }),
              emphasis === 'metric' &&
                'px-2 text-center text-base font-bold tabular-nums text-kv-text md:text-base',
              resolvedStartAddon && 'ps-1.5',
              endAddon && 'pe-1.5'
            )}
          />

          {endAddon ? (
            <div className="flex h-full shrink-0 items-center text-kv-text-placeholder">
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
