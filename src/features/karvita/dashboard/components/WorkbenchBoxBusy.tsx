'use client';

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

/**
 * جای محتوای باکس میز کار تا وقتی داده می‌آید — اسپینر وسط، بدون اسکلتون.
 */
export function WorkbenchBoxBusy({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'flex min-h-[6rem] flex-1 items-center justify-center',
        className
      )}
    >
      <Spinner className="size-5 text-kv-brand" aria-hidden="true" />
    </div>
  );
}
