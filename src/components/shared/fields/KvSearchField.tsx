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
  /**
   * When false, hide the magnifying-glass (e.g. combobox after the user typed).
   * Icon chrome stays owned by this component — callers must not pass `startIcon`.
   */
  showIcon?: boolean;
};

/**
 * Admin search field preset — magnifying-glass owned here (rule 75).
 * Presentation only; debounce / URL sync stay in feature hooks.
 */
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
          <FaIcon icon={faIcons.magnifyingGlass} size="xs" />
        ) : undefined
      }
      {...props}
    />
  );
});

KvSearchField.displayName = 'KvSearchField';
