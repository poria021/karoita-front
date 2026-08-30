import * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type KvInputProps = React.ComponentProps<'input'>;

export function KvInput({ className, ref, ...props }: KvInputProps) {
  return (
    <Input
      ref={ref}
      data-slot="kv-input"
      className={cn(
        'h-11 w-full min-w-0 rounded-kv-control border border-kv-border bg-kv-field',
        'px-3.5 font-sans text-xs font-bold text-kv-text-secondary shadow-none md:text-xs',
        'placeholder:text-kv-text-placeholder',
        'transition-[color,background-color,border-color,box-shadow]',
        'can-hover:enabled:hover:border-kv-border-hover',
        'focus-visible:border-kv-brand focus-visible:bg-kv-field',
        'focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
        'aria-invalid:border-kv-danger-border aria-invalid:ring-[3px] aria-invalid:ring-kv-ring-danger/15',
        'aria-invalid:enabled:hover:border-kv-danger-border',
        'aria-invalid:focus-visible:border-kv-danger',
        'disabled:cursor-not-allowed disabled:opacity-100',
        'selection:bg-kv-brand selection:text-kv-brand-fg',
        className
      )}
      {...props}
    />
  );
}
