'use client';

import * as React from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvTextField,
  type KvTextFieldProps,
} from '@/components/shared/fields/KvTextField';
import { faIcons } from '@/utils/iconMap';

export type KvSearchFieldProps = Omit<
  KvTextFieldProps,
  'startAddon' | 'startIcon' | 'type' | 'otpStyle'
> & {
  showIcon?: boolean;
  /** Show an X control when the field has a value (default true). */
  clearable?: boolean;
  onClear?: () => void;
};

export const KvSearchField = React.forwardRef<
  HTMLInputElement,
  KvSearchFieldProps
>(function KvSearchField(
  {
    label = false,
    size = 'md',
    showIcon = true,
    clearable = true,
    autoComplete = 'off',
    value,
    locked,
    endAddon,
    onChange,
    onClear,
    ...props
  },
  ref
) {
  const hasValue = String(value ?? '').length > 0;
  const showClear = clearable && !locked && hasValue;

  function emitClear(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onClear?.();
    if (!onChange) return;
    const target = { value: '' } as HTMLInputElement;
    onChange({
      target,
      currentTarget: target,
    } as React.ChangeEvent<HTMLInputElement>);
  }

  const resolvedEndAddon =
    showClear || endAddon ? (
      <span className="flex h-full items-center gap-0.5 pe-1.5">
        {showClear ? (
          <KvButton
            type="button"
            color="error"
            appearance="text"
            size="xs"
            tabIndex={-1}
            aria-label="پاک کردن جستجو"
            onClick={emitClear}
            icon={<FaIcon icon={faIcons.xmark} size="sm" />}
            className="text-kv-danger hover:text-kv-danger"
          />
        ) : null}
        {endAddon}
      </span>
    ) : undefined;

  return (
    <KvTextField
      ref={ref}
      type="text"
      label={label}
      size={size}
      autoComplete={autoComplete}
      value={value}
      locked={locked}
      onChange={onChange}
      startIcon={
        showIcon ? (
          <FaIcon icon={faIcons.magnifyingGlass} size="sm" />
        ) : undefined
      }
      endAddon={resolvedEndAddon}
      {...props}
    />
  );
});

KvSearchField.displayName = 'KvSearchField';
