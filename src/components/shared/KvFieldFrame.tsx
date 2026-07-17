'use client';

import { CircleAlert, Info, Lock } from 'lucide-react';
import * as React from 'react';

import { KvTypography } from '@/components/shared/KvTypography';

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
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/**
 * Shared chrome for Karvita fields: label (+ lock), control slot, error/hint.
 * Used by KvTextField / KvTextArea so spacing and copy stay identical.
 */
export function KvFieldFrame({
  id,
  label,
  required = false,
  optionalHint = false,
  locked = false,
  showLockIcon,
  error,
  hint,
  children,
  footer,
}: KvFieldFrameProps) {
  const showLabel = label !== undefined && label !== false && label !== '';
  const showLabelLock = locked && showLockIcon !== false;

  return (
    <div className="w-full font-sans" data-slot="kv-field-frame">
      {showLabel ? (
        <div className="mb-kv-field flex items-center gap-1.5" dir="rtl">
          <KvTypography variant="label" as="label" htmlFor={id}>
            {label}
            {required ? (
              <span className="ms-1 text-rose-500" aria-hidden="true">
                *
              </span>
            ) : null}
            {optionalHint ? (
              <span className="ms-1 font-normal text-slate-400">(اختیاری)</span>
            ) : null}
          </KvTypography>
          {showLabelLock ? (
            <Lock
              className="size-3.5 shrink-0 text-slate-400"
              aria-hidden="true"
            />
          ) : null}
        </div>
      ) : null}

      {children}

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
