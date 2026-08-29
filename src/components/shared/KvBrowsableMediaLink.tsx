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
   * تصویر را در PWA داخل مودال نشان بده.
   * برای PDF/متن خاموش بماند تا همان تب جدید (یا ناوبری سیستم) بماند.
   */
  previewAsImage?: boolean;
};

/**
 * در مرورگر تب جدید؛ در PWA برای تصویر مودال، چون `target=_blank` تب جدا ندارد.
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
  const useLightbox = standalone && previewAsImage;

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
