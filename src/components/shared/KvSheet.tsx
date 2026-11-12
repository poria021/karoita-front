'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { FaIcon } from '@/components/shared/FaIcon';
import { kvScrollAreaClassName } from '@/components/shared/KvScrollArea';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

export type KvSheetSide = 'left' | 'right';

export type KvSheetProps = React.ComponentProps<typeof Dialog>;

export type KvSheetContentProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Content>,
  'forceMount'
> & {
  side?: KvSheetSide;
  showCloseButton?: boolean;
};

/** همان ease ریل ماکت گزارش‌ها. */
const SHEET_EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

export function KvSheet(props: KvSheetProps) {
  return <Dialog data-slot="kv-sheet" {...props} />;
}

export function KvSheetContent({
  className,
  side = 'left',
  showCloseButton = true,
  children,
  ...props
}: KvSheetContentProps) {
  return (
    <DialogPortal>
      {/* فقط کمی تیره — بدون blur */}
      <DialogOverlay className="z-[84] bg-kv-scrim/35 backdrop-blur-none" />
      <DialogPrimitive.Content
        data-slot="kv-sheet-content"
        data-side={side}
        className={cn(
          kvScrollAreaClassName,
          'fixed top-kv-group bottom-kv-group z-[85] flex h-auto max-h-[calc(100dvh-2*var(--spacing-kv-group))] w-[min(24rem,calc(100vw-2*var(--spacing-kv-group)))] flex-col overflow-hidden',
          'rounded-kv-card border border-kv-border bg-kv-surface text-kv-text shadow-kv-floating outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'duration-[350ms]',
          SHEET_EASE,
          // physical-ok: floating filter panel on physical left
          side === 'left' &&
            'left-kv-group data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
          // physical-ok: floating filter panel on physical right
          side === 'right' &&
            'right-kv-group data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          'motion-reduce:transition-none motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none',
          className
        )}
        {...props}
      >
        <div className="flex min-h-0 flex-1 flex-col [direction:rtl]">
          {showCloseButton ? (
            <DialogClose
              type="button"
              aria-label="بستن"
              className="absolute end-3 top-3 z-10 flex size-8 items-center justify-center rounded-kv-control text-kv-text-faint transition-colors hover:bg-kv-surface-muted hover:text-kv-text focus-visible:ring-[3px] focus-visible:ring-kv-ring/20"
            >
              <FaIcon icon={faIcons.xmark} size="sm" />
            </DialogClose>
          ) : null}
          {children}
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/** هدر کشو — مطابق `rp-dlg-h` ماکت. */
export function KvSheetHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="kv-sheet-header"
      className={cn(
        'flex shrink-0 items-start justify-between gap-kv-group border-b border-kv-border-muted px-kv-stack py-kv-group',
        className
      )}
      {...props}
    />
  );
}

export function KvSheetBody({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="kv-sheet-body"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-kv-inline overflow-y-auto px-kv-stack py-kv-group',
        className
      )}
      {...props}
    />
  );
}

/** فوتر کشو — مطابق `rp-dr-f` ماکت (ستونی، دکمه‌های تمام‌عرض). */
export function KvSheetFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="kv-sheet-footer"
      className={cn(
        'flex shrink-0 flex-col gap-kv-pair border-t border-kv-border-muted px-kv-stack py-kv-inline',
        className
      )}
      {...props}
    />
  );
}

export function KvSheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  return (
    <DialogTitle
      data-slot="kv-sheet-title"
      className={cn(
        'text-base font-bold leading-snug tracking-tight text-kv-text sm:text-lg',
        className
      )}
      {...props}
    />
  );
}

export function KvSheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  return (
    <DialogDescription
      data-slot="kv-sheet-description"
      className={cn(
        'mt-1 text-xs font-medium leading-normal text-kv-text-faint',
        className
      )}
      {...props}
    />
  );
}

/** دکمهٔ بستن — مطابق `kv-btn s-icon-xs kv-close` ماکت. */
export function KvSheetClose({
  className,
  ...props
}: React.ComponentProps<typeof DialogClose>) {
  return (
    <DialogClose
      type="button"
      aria-label="بستن"
      data-slot="kv-sheet-close"
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full bg-kv-surface-subtle text-kv-text-subtle transition-colors hover:bg-kv-danger-soft hover:text-kv-danger focus-visible:ring-[3px] focus-visible:ring-kv-ring/20',
        className
      )}
      {...props}
    >
      <FaIcon icon={faIcons.xmark} size="xs" />
    </DialogClose>
  );
}
