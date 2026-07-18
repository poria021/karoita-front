'use client';

import * as React from 'react';

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

export type KvDialogProps = React.ComponentProps<typeof Dialog>;

export type KvDialogContentProps = React.ComponentProps<typeof DialogContent> & {
  /** Max width token. Default `md` (`sm:max-w-md`). */
  size?: 'sm' | 'md' | 'lg';
};

const SIZE_CLASS: Record<NonNullable<KvDialogContentProps['size']>, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
};

/** Karvita dialog root — controlled via `open` / `onOpenChange`. */
export function KvDialog(props: KvDialogProps) {
  return <Dialog data-slot="kv-dialog" {...props} />;
}

/** Panel chrome: surface, card radius, floating elevation. */
export function KvDialogContent({
  className,
  size = 'md',
  ...props
}: KvDialogContentProps) {
  return (
    <DialogContent
      data-slot="kv-dialog-content"
      className={cn(SIZE_CLASS[size], className)}
      {...props}
    />
  );
}

export function KvDialogHeader({
  className,
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  return (
    <DialogHeader
      data-slot="kv-dialog-header"
      className={cn('mb-kv-section gap-1', className)}
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
      className={cn('mt-2 gap-2 sm:justify-stretch', className)}
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
      className={cn('text-base font-extrabold sm:text-lg', className)}
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
      className={className}
      {...props}
    />
  );
}

export {
  DialogClose as KvDialogClose,
  DialogTrigger as KvDialogTrigger,
};
