import * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type KvInputProps = React.ComponentProps<'input'>;

/** Thin Karvita input primitive — prefer `KvTextField` for labeled form fields. */
export function KvInput({ className, ...props }: KvInputProps) {
  return (
    <Input
      data-slot="kv-input"
      className={cn(
        /* Neutralize Shadcn Input defaults that fight KvTextField sizing */
        'h-auto rounded-kv-control border-kv-border-strong font-sans text-xs font-bold text-kv-text-secondary shadow-none md:text-xs',
        'placeholder:text-kv-text-faint',
        'focus-visible:border-kv-brand focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
        className
      )}
      {...props}
    />
  );
}
