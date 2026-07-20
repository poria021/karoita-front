import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type KvMediaAsideProps = {
  media: ReactNode;
  children: ReactNode;
};

export function KvMediaAside({ media, children }: KvMediaAsideProps) {
  return (
    <div
      data-slot="kv-media-aside"
      className={cn(
        'flex flex-col items-center gap-kv-group sm:flex-row sm:items-start'
      )}
    >
      {media}
      <div className="w-full min-w-0 grow">{children}</div>
    </div>
  );
}
