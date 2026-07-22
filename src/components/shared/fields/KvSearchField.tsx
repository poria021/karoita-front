'use client';

import * as React from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
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
};

export const KvSearchField = React.forwardRef<
  HTMLInputElement,
  KvSearchFieldProps
>(function KvSearchField(
  {
    label = false,
    size = 'sm',
    showIcon = true,
    autoComplete = 'off',
    ...props
  },
  ref
) {
  return (
    <KvTextField
      ref={ref}
      type="text"
      label={label}
      size={size}
      autoComplete={autoComplete}
      startIcon={
        showIcon ? (
          <FaIcon icon={faIcons.magnifyingGlass} size="md" />
        ) : undefined
      }
      {...props}
    />
  );
});

KvSearchField.displayName = 'KvSearchField';
