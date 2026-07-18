'use client';

import * as React from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

export type KvMediaThumbKind = 'image' | 'pdf' | 'empty';

export type KvMediaThumbProps = {
  /** Media URL (data URI or remote). Omit / empty → empty state. */
  src?: string | null;
  /** Override auto-detection from `src`. */
  kind?: KvMediaThumbKind;
  alt?: string;
  emptyLabel?: string;
  pdfLabel?: string;
  /** When set, thumb is an interactive control that opens preview. */
  onPreview?: (src: string) => void;
  className?: string;
  'aria-label'?: string;
};

function resolveKind(
  src: string | null | undefined,
  kind?: KvMediaThumbKind
): KvMediaThumbKind {
  if (kind) return kind;
  if (!src) return 'empty';
  if (src.startsWith('data:application/pdf')) return 'pdf';
  return 'image';
}

const FRAME =
  'flex h-24 w-20 shrink-0 flex-col items-center justify-center overflow-hidden rounded-kv-panel p-1';

/**
 * Compact image / PDF / empty media thumbnail for admin review panels.
 * Interactive when `onPreview` + `src` are provided.
 */
export function KvMediaThumb({
  src,
  kind: kindProp,
  alt = '',
  emptyLabel = 'فاقد مدرک پیوست',
  pdfLabel = 'سند PDF',
  onPreview,
  className,
  'aria-label': ariaLabel,
}: KvMediaThumbProps) {
  const kind = resolveKind(src, kindProp);

  if (kind === 'empty' || !src) {
    return (
      <div
        className={cn(
          FRAME,
          'border border-dashed border-kv-border bg-kv-surface-muted text-center text-kv-text-faint',
          className
        )}
      >
        <FaIcon icon={faIcons.eyeSlash} size="md" />
        <span className="mt-1 text-xs font-bold leading-tight">{emptyLabel}</span>
      </div>
    );
  }

  const preview = () => onPreview?.(src);

  const body =
    kind === 'pdf' ? (
      <span className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-kv-control bg-kv-danger-soft text-kv-danger">
        <FaIcon icon={faIcons.filePdf} size="lg" />
        <span className="text-xs font-bold">{pdfLabel}</span>
      </span>
    ) : (
      // eslint-disable-next-line @next/next/no-img-element -- data-URI / arbitrary preview URLs
      <img
        src={src}
        alt={alt}
        className="h-full w-full rounded-kv-control object-cover"
      />
    );

  if (!onPreview) {
    return <div className={cn(FRAME, 'border border-kv-border bg-kv-surface-muted', className)}>{body}</div>;
  }

  return (
    <KvButton
      type="button"
      appearance="secondary"
      className={cn(FRAME, 'p-1', className)}
      aria-label={ariaLabel ?? 'پیش‌نمایش مدرک'}
      onClick={preview}
    >
      {body}
    </KvButton>
  );
}
