'use client';

import type { ReactNode } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import { faIcons } from '@/utils/iconMap';

export type KvFieldFrameProps = {
  id: string;
  /** Omit or pass `false` to hide label entirely */
  label?: string | false;
  required?: boolean;
  optionalHint?: boolean;
  locked?: boolean;
  showLockIcon?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Label adornment modes are mutually exclusive (never combine):
 * - locked → lock icon only (requires `showLockIcon`)
 * - required → red asterisk only
 * - optional → "(اختیاری)" only
 *
 * `locked` on the control still disables input; the label lock is opt-in via
 * `showLockIcon` so section headers can own the lock instead of every field.
 */
export type KvFieldLabelMode = 'locked' | 'required' | 'optional' | 'plain';

export function resolveFieldLabelMode(options: {
  locked?: boolean;
  required?: boolean;
  optionalHint?: boolean;
}): KvFieldLabelMode {
  if (options.locked) return 'locked';
  if (options.required) return 'required';
  if (options.optionalHint) return 'optional';
  return 'plain';
}

/**
 * Shared chrome for Karvita fields: label (+ optional lock), control slot, error/hint.
 * Used by KvTextField / KvTextArea so spacing and copy stay identical.
 */
export function KvFieldFrame({
  id,
  label,
  required = false,
  optionalHint = false,
  locked = false,
  showLockIcon = false,
  error,
  hint,
  children,
  footer,
}: KvFieldFrameProps) {
  const showLabel = label !== undefined && label !== false && label !== '';
  const showLabelLock = Boolean(locked && showLockIcon);
  const labelMode = resolveFieldLabelMode({
    locked: showLabelLock,
    required,
    optionalHint,
  });

  return (
    <div className="w-full font-sans" data-slot="kv-field-frame">
      {showLabel ? (
        <div className="mb-kv-field flex items-center gap-1.5" dir="rtl">
          <KvTypography variant="label" as="label" htmlFor={id}>
            {label}
            {showLabelLock ? (
              <FaIcon
                icon={faIcons.lock}
                size="xs"
                className="ms-1 inline align-middle text-kv-text-faint"
              />
            ) : null}
            {labelMode === 'required' ? (
              <span className="ms-1 text-kv-danger" aria-hidden="true">
                *
              </span>
            ) : null}
            {labelMode === 'optional' ? (
              <span className="ms-1 font-normal text-kv-text-faint">(اختیاری)</span>
            ) : null}
          </KvTypography>
        </div>
      ) : null}

      {children}

      {error ? (
        <div
          className="mt-kv-field flex items-start gap-1.5"
          id={`${id}-error`}
          role="alert"
        >
          <FaIcon
            icon={faIcons.circleExclamation}
            size="xs"
            className="mt-0.5 shrink-0 text-kv-danger"
          />
          <KvTypography variant="error" tone="danger" as="span">
            {error}
          </KvTypography>
        </div>
      ) : hint ? (
        <div className="mt-kv-field flex items-start gap-1.5" id={`${id}-hint`}>
          <FaIcon
            icon={faIcons.circleInfo}
            size="xs"
            className="mt-0.5 shrink-0 text-kv-text-faint"
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
