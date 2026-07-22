'use client';

import { cn } from '@/lib/utils';
import { kvOverlaySeparatorClassName } from '@/components/shared/kvOverlayMenu';

export type KvOverlaySeparatorProps = {
  className?: string;
};

/** جداکنندهٔ نرم مشترک برای منو / سلکت / اعلان. */
export function KvOverlaySeparator({ className }: KvOverlaySeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      data-slot="kv-overlay-separator"
      className={cn(kvOverlaySeparatorClassName, className)}
    />
  );
}
