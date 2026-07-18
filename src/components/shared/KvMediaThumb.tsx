'use client';

import * as React from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

export type KvMediaThumbKind = 'image' | 'pdf' | 'empty';
export type KvMediaThumbSize = 'sm' | 'md' | 'lg';
export type KvMediaThumbVariant = 'thumb' | 'preview';

export type KvMediaThumbProps = {
  /** Media URL (data URI or remote). Omit / empty → empty state. */
  src?: string | null;
  /** Override auto-detection from `src`. */
  kind?: KvMediaThumbKind;
  size?: KvMediaThumbSize;
  variant?: KvMediaThumbVariant;
  /** Stretch to full width of parent (mobile accordion). */
  fluid?: boolean;
  alt?: string;
  emptyLabel?: string;
  pdfLabel?: string;
  /** When set, thumb is an interactive control that opens preview. */
  onPreview?: (src: string) => void;
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

const SIZE_CLASS: Record<KvMediaThumbSize, string> = {
  sm: 'h-20 w-16',
  md: 'h-24 w-20',
  lg: 'h-28 w-24',
};

/**
 * Compact image / PDF / empty media thumbnail for admin review panels.
 * Interactive when `onPreview` + `src` are provided.
 */
export function KvMediaThumb({
  src,
  kind: kindProp,
  size = 'md',
  variant = 'thumb',
  fluid = false,
  alt = '',
  emptyLabel = 'فاقد مدرک پیوست',
  pdfLabel = 'سند PDF',
  onPreview,
  'aria-label': ariaLabel,
}: KvMediaThumbProps) {
  const kind = resolveKind(src, kindProp);

  if (variant === 'preview' && src && kind === 'image') {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data-URI / arbitrary preview URLs
      <img
        data-slot="kv-media-thumb-preview"
        src={src}
        alt={alt || 'پیش‌نمایش مدرک'}
        className="mx-auto max-h-[70vh] w-auto max-w-full rounded-kv-panel border border-kv-border object-contain"
      />
    );
  }

  const frame = cn(
    'flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-kv-panel p-1',
    fluid ? 'h-28 w-full sm:w-24' : SIZE_CLASS[size]
  );

  if (kind === 'empty' || !src) {
    return (
      <div
        data-slot="kv-media-thumb"
        className={cn(
          frame,
          'border border-dashed border-kv-border bg-kv-surface-muted text-center text-kv-text-faint'
        )}
      >
        <FaIcon icon={faIcons.eyeSlash} size="md" />
        <KvTypography variant="caption" weight="bold" as="span">
          {emptyLabel}
        </KvTypography>
      </div>
    );
  }

  const preview = () => onPreview?.(src);

  const body =
    kind === 'pdf' ? (
      <span className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-kv-control bg-kv-danger-soft text-kv-danger">
        <FaIcon icon={faIcons.filePdf} size="lg" />
        <KvTypography variant="caption" weight="bold" as="span">
          {pdfLabel}
        </KvTypography>
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
    return (
      <div
        data-slot="kv-media-thumb"
        className={cn(frame, 'border border-kv-border bg-kv-surface-muted')}
      >
        {body}
      </div>
    );
  }

  return (
    <KvButton
      type="button"
      appearance="secondary"
      data-slot="kv-media-thumb"
      className={cn(frame, 'p-1')}
      aria-label={ariaLabel ?? 'پیش‌نمایش مدرک'}
      onClick={preview}
    >
      {body}
    </KvButton>
  );
}
