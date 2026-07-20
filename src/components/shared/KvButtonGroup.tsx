import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type KvButtonGroupAlign = 'start' | 'center' | 'end';

export type KvButtonGroupProps = {
  children: ReactNode;
  align?: KvButtonGroupAlign;
  fullWidth?: boolean;
};

const ALIGN_CLASS: Record<KvButtonGroupAlign, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
};

export function KvButtonGroup({
  children,
  align = 'start',
  fullWidth = false,
}: KvButtonGroupProps) {
  return (
    <div
      data-slot="kv-button-group"
      className={cn(
        'flex items-center gap-kv-pair',
        ALIGN_CLASS[align],
        fullWidth && 'w-full [&>*]:min-w-0 [&>*]:flex-1'
      )}
    >
      {children}
    </div>
  );
}
