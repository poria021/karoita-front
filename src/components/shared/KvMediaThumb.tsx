'use client';

import * as React from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvBrowsableMediaLink } from '@/components/shared/KvBrowsableMediaLink';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import {
  isBrowsableMediaUrl,
  resolveNestFileUrl,
} from '@/services/files/resolve-nest-file-url';
import { faIcons } from '@/utils/iconMap';

export type KvMediaThumbKind = 'image' | 'pdf' | 'text' | 'empty';
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
  textLabel?: string;
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
  if (src.startsWith('data:text/plain')) return 'text';
  return 'image';
}

const SIZE_CLASS: Record<KvMediaThumbSize, string> = {
  sm: 'h-20 w-16',
  md: 'h-24 w-20',
  lg: 'h-28 w-24',
};

/**
 * بندانگشتی مدرک (تصویر/PDF/متن/خالی) برای پنل‌های بررسی ادمین.
 * با `openInNewTab` تصویر در مرورگر تب جدید و در PWA مودال است؛ PDF/متن تب جدید می‌ماند.
 */
export function KvMediaThumb(props: KvMediaThumbProps) {
  const resolvedSrc = resolveNestFileUrl(props.src) ?? props.src ?? null;
  // تعویض src باید failed را صفر کند — remount با key معادل reset در useEffect است.
  return (
    <KvMediaThumbBody key={resolvedSrc ?? ''} {...props} resolvedSrc={resolvedSrc} />
  );
}

function KvMediaThumbBody({
  resolvedSrc,
  kind: kindProp,
  size = 'md',
  variant = 'thumb',
  fluid = false,
  alt = '',
  emptyLabel = 'فاقد مدرک پیوست',
  pdfLabel = 'سند PDF',
  textLabel = 'سند متنی',
  openInNewTab = false,
  'aria-label': ariaLabel,
}: KvMediaThumbProps & { resolvedSrc: string | null }) {
  const kind = resolveKind(resolvedSrc, kindProp);
  const [failed, setFailed] = React.useState(false);

  const canOpen =
    openInNewTab &&
    Boolean(resolvedSrc) &&
    isBrowsableMediaUrl(resolvedSrc ?? '') &&
    !failed;

  const frame = cn(
    'flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-kv-panel p-1',
    fluid ? 'h-28 w-full sm:w-24' : SIZE_CLASS[size]
  );

  if (failed || kind === 'empty' || !resolvedSrc) {
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

  if (variant === 'preview' && resolvedSrc && kind === 'image') {
    const preview = (
      // eslint-disable-next-line @next/next/no-img-element -- data-URI / arbitrary preview URLs
      <img
        data-slot="kv-media-thumb-preview"
        src={resolvedSrc}
        alt={alt || 'پیش‌نمایش مدرک'}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="mx-auto max-h-[70vh] w-auto max-w-full rounded-kv-panel border border-kv-border object-contain"
      />
    );
    if (canOpen) {
      return (
        <KvBrowsableMediaLink
          href={resolvedSrc}
          alt={alt || 'پیش‌نمایش مدرک'}
          previewAsImage={kind === 'image'}
          aria-label={
            ariaLabel ??
            (kind === 'image' ? 'نمایش تصویر' : 'باز کردن مدرک در تب جدید')
          }
          className="block focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20"
        >
          {preview}
        </KvBrowsableMediaLink>
      );
    }
    return preview;
  }

  const body =
    kind === 'pdf' ? (
      <span className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-kv-control bg-kv-danger-soft text-kv-danger">
        <FaIcon icon={faIcons.filePdf} size="lg" />
        <KvTypography variant="caption" weight="bold" as="span">
          {pdfLabel}
        </KvTypography>
      </span>
    ) : kind === 'text' ? (
      <span className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-kv-control bg-kv-info-soft text-kv-info-soft-fg">
        <FaIcon icon={faIcons.file} size="lg" />
        <KvTypography variant="caption" weight="bold" as="span">
          {textLabel}
        </KvTypography>
      </span>
    ) : (
      // eslint-disable-next-line @next/next/no-img-element -- data-URI / arbitrary preview URLs
      <img
        src={resolvedSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="h-full w-full rounded-kv-control object-cover"
      />
    );

  if (!canOpen) {
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
    <KvBrowsableMediaLink
      href={resolvedSrc}
      alt={alt}
      previewAsImage={kind === 'image'}
      data-slot="kv-media-thumb"
      className={cn(
        frame,
        'cursor-pointer border border-kv-border bg-kv-surface-muted transition-colors',
        'hover:border-kv-brand hover:bg-kv-brand-soft/30',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20'
      )}
      aria-label={
        ariaLabel ??
        (kind === 'image' ? 'نمایش تصویر' : 'باز کردن مدرک در تب جدید')
      }
    >
      {body}
    </KvBrowsableMediaLink>
  );
}
