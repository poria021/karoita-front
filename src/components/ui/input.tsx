import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({
  className,
  type,
  ref,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        'h-9 w-full min-w-0 rounded-kv-control border bg-transparent px-3 py-1 text-base outline-none md:text-sm',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Input };
