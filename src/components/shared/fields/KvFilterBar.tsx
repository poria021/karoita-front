import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type KvFilterBarControlWidth = 'sm' | 'md';

export type KvFilterBarProps = {
  children: ReactNode;
};

export type KvFilterBarSearchProps = {
  children: ReactNode;
};

export type KvFilterBarControlProps = {
  children: ReactNode;
  width?: KvFilterBarControlWidth;
};

const CONTROL_WIDTH_CLASS: Record<KvFilterBarControlWidth, string> = {
  sm: 'sm:w-36',
  md: 'sm:w-44',
};

/**
 * Shared admin filter strip — search grows, selects stay fixed width.
 */
export function KvFilterBar({ children }: KvFilterBarProps) {
  return (
    <div
      data-slot="kv-filter-bar"
      className="flex w-full flex-col items-stretch gap-kv-pair sm:flex-row sm:items-center"
    >
      {children}
    </div>
  );
}

export function KvFilterBarSearch({ children }: KvFilterBarSearchProps) {
  return (
    <div data-slot="kv-filter-bar-search" className="w-full flex-1">
      {children}
    </div>
  );
}

export function KvFilterBarControl({
  children,
  width = 'sm',
}: KvFilterBarControlProps) {
  return (
    <div
      data-slot="kv-filter-bar-control"
      className={cn('w-full shrink-0', CONTROL_WIDTH_CLASS[width])}
    >
      {children}
    </div>
  );
}
