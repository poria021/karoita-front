'use client';

import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogHeader,
  KvDialogTitle,
} from '@/components/shared/KvDialog';

export type KvImageLightboxProps = {
  src: string;
  alt?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * پیش‌نمایش تمام‌صفحهٔ تصویر وقتی تب جدید در دسترس نیست (مثلاً PWA standalone).
 */
export function KvImageLightbox({
  src,
  alt = '',
  open,
  onOpenChange,
}: KvImageLightboxProps) {
  return (
    <KvDialog open={open} onOpenChange={onOpenChange}>
      <KvDialogContent
        size="xl"
        className="max-h-[calc(100dvh-1.5rem)] max-w-[min(96vw,56rem)] overflow-hidden p-kv-group"
      >
        <KvDialogHeader className="border-0 pe-10 pb-kv-pair">
          <KvDialogTitle>پیش‌نمایش تصویر</KvDialogTitle>
          <KvDialogDescription className="sr-only">
            تصویر در اندازهٔ بزرگ‌تر. برای بستن، بیرون از کادر را لمس کنید یا
            دکمهٔ بستن را بزنید.
          </KvDialogDescription>
        </KvDialogHeader>
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary / blob / data preview URLs */}
        <img
          src={src}
          alt={alt || 'پیش‌نمایش تصویر'}
          referrerPolicy="no-referrer"
          className="mx-auto max-h-[min(78dvh,40rem)] w-auto max-w-full object-contain"
        />
      </KvDialogContent>
    </KvDialog>
  );
}
