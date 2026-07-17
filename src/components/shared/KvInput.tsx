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
        'h-auto rounded-kv-control border-slate-300 font-sans text-xs font-bold text-slate-800 shadow-none md:text-xs',
        'placeholder:text-slate-400',
        'focus-visible:border-brand-500 focus-visible:ring-[3px] focus-visible:ring-brand-500/15',
        className
      )}
      {...props}
    />
  );
}
