'use client';

import * as React from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvTextField,
  type KvTextFieldSize,
} from '@/components/shared/fields/KvTextField';
import { faIcons } from '@/utils/iconMap';
import {
  PASSWORD_LATIN_ONLY_HINT,
  containsPersianOrArabicScript,
  stripPersianOrArabicScript,
} from '@/utils/passwordInput';

export type KvPasswordFieldProps = {
  id?: string;
  label?: string | false;
  required?: boolean;
  error?: string;
  hint?: string;
  locked?: boolean;
  showLockIcon?: boolean;
  size?: KvTextFieldSize;
  placeholder?: string;
  autoComplete?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  footer?: React.ReactNode;
  suppressBrowserAutofill?: boolean;
};

export const KvPasswordField = React.forwardRef<
  HTMLInputElement,
  KvPasswordFieldProps
>(function KvPasswordField(
  {
    id,
    label = 'رمز عبور',
    required = false,
    error,
    hint,
    locked = false,
    showLockIcon,
    size = 'md',
    placeholder = '********',
    autoComplete = 'current-password',
    name,
    value,
    defaultValue,
    onChange,
    onBlur,
    onFocus,
    footer,
    suppressBrowserAutofill = false,
  },
  ref
) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [autofillUnlocked, setAutofillUnlocked] = React.useState(
    !suppressBrowserAutofill
  );
  const [persianScriptError, setPersianScriptError] = React.useState<
    string | undefined
  >();

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (suppressBrowserAutofill && !autofillUnlocked) {
      setAutofillUnlocked(true);
    }
    onFocus?.(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (containsPersianOrArabicScript(raw)) {
      event.target.value = stripPersianOrArabicScript(raw);
      setPersianScriptError(PASSWORD_LATIN_ONLY_HINT);
    } else if (persianScriptError) {
      setPersianScriptError(undefined);
    }
    onChange?.(event);
  };

  return (
    <KvTextField
      id={id}
      ref={ref}
      label={label}
      required={required}
      type={isVisible ? 'text' : 'password'}
      size={size}
      dir="ltr"
      autoComplete={
        suppressBrowserAutofill ? 'new-password' : autoComplete
      }
      placeholder={placeholder}
      locked={locked}
      showLockIcon={showLockIcon}
      readOnly={!autofillUnlocked}
      value={value}
      defaultValue={defaultValue}
      name={name}
      onBlur={onBlur}
      onFocus={handleFocus}
      onChange={handleChange}
      error={persianScriptError ?? error}
      hint={persianScriptError ? undefined : hint}
      footer={footer}
      endAddon={
        locked ? undefined : (
          <KvButton
            type="button"
            color="neutral"
            appearance="text"
            size="xs"
            icon={
              <FaIcon
                icon={isVisible ? faIcons.eyeSlash : faIcons.eye}
                size="sm"
              />
            }
            onClick={() => setIsVisible((current) => !current)}
            aria-label={isVisible ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
            aria-pressed={isVisible}
            className="me-0.5 text-kv-text-placeholder hover:text-kv-text-placeholder"
          />
        )
      }
    />
  );
});

KvPasswordField.displayName = 'KvPasswordField';
