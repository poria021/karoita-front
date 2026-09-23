'use client';

import * as React from 'react';

import { KvImageLightbox } from '@/components/shared/KvImageLightbox';
import { usePwaStandalone } from '@/hooks/usePwaInstall';
import { cn } from '@/lib/utils';

export type KvBrowsableMediaLinkProps = {
  href: string;
  alt?: string;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  'data-slot'?: string;
  /**
   * تصویر را در PWA و برای `data:` URL داخل مودال نشان بده.
   * برای PDF/متن خاموش بماند تا همان تب جدید (یا ناوبری سیستم) بماند.
   */
  previewAsImage?: boolean;
};

/** کروم/اج ناوبری سطح بالا به `data:` را مسدود می‌کنند؛ `<img>` همان URL را نشان می‌دهد. */
function shouldUseImageLightbox(href: string, standalone: boolean): boolean {
  return standalone || href.trim().startsWith('data:');
}

/**
 * در مرورگر تب جدید؛ برای PWA و `data:` URL تصویر، مودال — `target=_blank` روی data خالی است.
 */
export function KvBrowsableMediaLink({
  href,
  alt = '',
  children,
  className,
  'aria-label': ariaLabel,
  'data-slot': dataSlot,
  previewAsImage = true,
}: KvBrowsableMediaLinkProps) {
  const standalone = usePwaStandalone();
  const [open, setOpen] = React.useState(false);
  const useLightbox = previewAsImage && shouldUseImageLightbox(href, standalone);

  if (!useLightbox) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel}
        data-slot={dataSlot}
      >
        {children}
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        className={cn(
          'cursor-pointer border-0 bg-transparent p-0 text-inherit',
          className
        )}
        aria-label={ariaLabel ?? 'نمایش تصویر'}
        data-slot={dataSlot}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      <KvImageLightbox
        src={href}
        alt={alt}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
