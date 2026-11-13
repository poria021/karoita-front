'use client';

import type { ReactNode } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';

export type KvEmptyStateTone = 'muted' | 'danger';

export type KvEmptyStateProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  tone?: KvEmptyStateTone;
  className?: string;
};

/** empty بدون آیکن؛ تیتر `body` و توضیح `caption` — مقیاس استاندارد سیستم. */
export function KvEmptyState({
  title,
  description,
  actions,
  tone = 'muted',
  className,
}: KvEmptyStateProps) {
  return (
    <div
      data-slot="kv-empty-state"
      className={cn(
        'flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center gap-kv-pair px-kv-inset py-kv-block text-center',
        className
      )}
      role="status"
    >
      <div className="max-w-md space-y-kv-pair">
        <KvTypography variant="body" tone={tone} as="p">
          {title}
        </KvTypography>
        {description ? (
          typeof description === 'string' ? (
            <KvTypography variant="caption" tone="muted" as="p">
              {description}
            </KvTypography>
          ) : (
            description
          )
        ) : null}
      </div>
      {actions ? (
        <div className="mt-kv-field flex flex-wrap items-center justify-center gap-kv-inline">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
