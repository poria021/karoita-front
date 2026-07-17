'use client';

import * as React from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvTextField,
  type KvTextFieldSize,
} from '@/components/shared/KvTextField';
import { faIcons } from '@/utils/iconMap';

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
};

/**
 * Password preset on {@link KvTextField} with visibility toggle.
 */
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
  },
  ref
) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <KvTextField
      id={id}
      ref={ref}
      label={label}
      required={required}
      type={isVisible ? 'text' : 'password'}
      size={size}
      dir="ltr"
      autoComplete={autoComplete}
      placeholder={placeholder}
      locked={locked}
      showLockIcon={showLockIcon}
      value={value}
      defaultValue={defaultValue}
      name={name}
      onBlur={onBlur}
      onFocus={onFocus}
      onChange={onChange}
      error={error}
      hint={hint}
      footer={footer}
      endAddon={
        locked ? undefined : (
          <KvButton
            type="button"
            color="neutral"
            appearance="text"
            icon={
              <FaIcon
                icon={isVisible ? faIcons.eyeSlash : faIcons.eye}
                size="xs"
              />
            }
            onClick={() => setIsVisible((current) => !current)}
            aria-label={isVisible ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
            aria-pressed={isVisible}
            className="me-2"
          />
        )
      }
    />
  );
});

KvPasswordField.displayName = 'KvPasswordField';
