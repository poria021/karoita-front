import * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type KvInputProps = React.ComponentProps<'input'>;

/**
 * Karvita bare input — same focus/hover tokens as {@link KvTextField} / {@link KvSelectTrigger}.
 * Prefer `KvTextField` for labeled form fields.
 */
export function KvInput({ className, ...props }: KvInputProps) {
  return (
    <Input
      data-slot="kv-input"
      className={cn(
        'h-11 w-full min-w-0 rounded-kv-control border border-kv-border-strong bg-kv-surface',
        'px-3.5 font-sans text-xs font-bold text-kv-text-secondary shadow-none md:text-xs',
        'placeholder:text-kv-text-placeholder',
        'transition-[color,background-color,border-color,box-shadow]',
        'hover:border-kv-border-strong hover:bg-kv-border-strong/25',
        'focus-visible:border-kv-brand focus-visible:bg-kv-surface',
        'focus-visible:hover:border-kv-brand focus-visible:hover:bg-kv-surface',
        'focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
        'aria-invalid:border-kv-danger-border aria-invalid:ring-[3px] aria-invalid:ring-kv-ring-danger/15',
        'aria-invalid:hover:border-kv-danger-border aria-invalid:hover:bg-kv-danger-border/20',
        'aria-invalid:focus-visible:border-kv-danger aria-invalid:focus-visible:hover:bg-kv-surface',
        'disabled:cursor-not-allowed disabled:opacity-100',
        'selection:bg-kv-brand selection:text-kv-brand-fg',
        className
      )}
      {...props}
    />
  );
}
