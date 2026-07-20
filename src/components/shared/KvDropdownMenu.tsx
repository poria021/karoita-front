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
import { cn } from '@/lib/utils';

export {
  DropdownMenu as KvDropdownMenu,
  DropdownMenuGroup as KvDropdownMenuGroup,
  DropdownMenuLabel as KvDropdownMenuLabel,
  DropdownMenuSeparator as KvDropdownMenuSeparator,
  DropdownMenuTrigger as KvDropdownMenuTrigger,
};

export function KvDropdownMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="kv-dropdown-menu-content"
      className={cn(className)}
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
      className={cn('font-sans text-xs font-bold', className)}
      {...props}
    />
  );
}
