'use client';

import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { kvOverlayPanelClassName } from '@/components/shared/kvOverlayMenu';
import { cn } from '@/lib/utils';

export {
  DropdownMenu as KvDropdownMenu,
  DropdownMenuGroup as KvDropdownMenuGroup,
  DropdownMenuLabel as KvDropdownMenuLabel,
  DropdownMenuTrigger as KvDropdownMenuTrigger,
};

export function KvDropdownMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      dir="rtl"
      data-slot="kv-dropdown-menu-content"
      className={cn(kvOverlayPanelClassName, className)}
      {...props}
    />
  );
}

export function KvDropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuItem
      data-slot="kv-dropdown-menu-item"
      className={cn(
        'rounded-none px-3.5 py-2.5 font-sans text-xs font-bold',
        'focus:bg-kv-surface-muted focus:text-kv-text-secondary',
        className
      )}
      {...props}
    />
  );
}

export function KvDropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return (
    <DropdownMenuSeparator
      data-slot="kv-dropdown-menu-separator"
      className={cn('mx-0 my-0 bg-kv-border/40', className)}
      {...props}
    />
  );
}
