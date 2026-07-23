'use client';

import * as React from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

export type KvMediaThumbKind = 'image' | 'pdf' | 'empty';
export type KvMediaThumbSize = 'sm' | 'md' | 'lg';
export type KvMediaThumbVariant = 'thumb' | 'preview';

export type KvMediaThumbProps = {
  src?: string | null;
  kind?: KvMediaThumbKind;
  size?: KvMediaThumbSize;
  variant?: KvMediaThumbVariant;
  fluid?: boolean;
  alt?: string;
  emptyLabel?: string;
  pdfLabel?: string;
  openInNewTab?: boolean;
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
 * بندانگشتی مدرک (تصویر/PDF/خالی) برای پنل‌های بررسی ادمین.
 * با `openInNewTab` فایل در تب جدید باز می‌شود؛ دیالوگ درون‌برنامه‌ای ندارد.
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
  openInNewTab = false,
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
          'border border-dashed border-kv-border bg-kv-surface-muted px-kv-pair text-center'
        )}
      >
        <KvTypography
          variant="overline"
          tone="disabled"
          weight="medium"
          align="center"
          as="span"
        >
          {emptyLabel}
        </KvTypography>
      </div>
    );
  }

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

  if (!openInNewTab) {
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
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      data-slot="kv-media-thumb"
      className={cn(
        frame,
        'cursor-pointer border border-kv-border bg-kv-surface-muted transition-colors',
        'hover:border-kv-brand hover:bg-kv-brand-soft/30',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20'
      )}
      aria-label={ariaLabel ?? 'باز کردن مدرک در تب جدید'}
    >
      {body}
    </a>
  );
}
