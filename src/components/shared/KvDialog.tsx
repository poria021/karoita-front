'use client';

import * as React from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

export type KvDialogProps = React.ComponentProps<typeof Dialog>;

export type KvDialogContentProps = React.ComponentProps<typeof DialogContent> & {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
};

const SIZE_CLASS: Record<NonNullable<KvDialogContentProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-3xl',
};

export function KvDialog(props: KvDialogProps) {
  return <Dialog data-slot="kv-dialog" {...props} />;
}

export function KvDialogContent({
  className,
  size = 'md',
  showCloseButton = true,
  children,
  ...props
}: KvDialogContentProps) {
  return (
    <DialogContent
      data-slot="kv-dialog-content"
      className={cn(SIZE_CLASS[size], className)}
      {...props}
    >
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
    </DialogContent>
  );
}

export function KvDialogHeader({
  className,
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  return (
    <DialogHeader
      data-slot="kv-dialog-header"
      className={cn(
        'border-b border-kv-border-muted pe-kv-region pb-kv-inline',
        className
      )}
      {...props}
    />
  );
}

export function KvDialogFooter({
  className,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter
      data-slot="kv-dialog-footer"
      className={cn('border-t border-kv-border-muted pt-kv-group', className)}
      {...props}
    />
  );
}

export function KvDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  return (
    <DialogTitle
      data-slot="kv-dialog-title"
      className={cn('text-xs font-black text-kv-text', className)}
      {...props}
    />
  );
}

export function KvDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  return (
    <DialogDescription
      data-slot="kv-dialog-description"
      className={cn(
        'mt-1 text-xs font-bold leading-relaxed text-kv-text-faint',
        className
      )}
      {...props}
    />
  );
}

export {
  DialogClose as KvDialogClose,
  DialogTrigger as KvDialogTrigger,
};
