import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type KvDescriptionListProps = {
  children: ReactNode;
};

export function KvDescriptionList({ children }: KvDescriptionListProps) {
  return (
    <dl data-slot="kv-description-list" className="space-y-3.5">
      {children}
    </dl>
  );
}

export type KvDescriptionItemProps = {
  label: string;
  value: ReactNode;
  mono?: boolean;
};

export function KvDescriptionItem({
  label,
  value,
  mono = false,
}: KvDescriptionItemProps) {
  return (
    <div
      data-slot="kv-description-item"
      className="flex justify-between gap-kv-group border-b border-kv-border-muted pb-1.5 last:border-b-0"
    >
      <dt className="font-sans text-xs font-bold text-kv-text-muted">{label}:</dt>
      <dd
        className={cn(
          'text-end font-sans text-xs font-bold text-kv-text',
          mono && 'font-mono'
        )}
      >
        {value}
      </dd>
    </div>
  );
}
