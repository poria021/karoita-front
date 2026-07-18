import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Shadcn-style Textarea primitive. Product field chrome lives in `KvTextArea`.
 */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-16 w-full rounded-kv-control border bg-transparent px-3 py-2 text-base outline-none md:text-sm',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
