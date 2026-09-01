'use client';

import type { ReactNode } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

export type KvEmptyStateTone = 'muted' | 'danger';

export type KvEmptyStateProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  tone?: KvEmptyStateTone;
  className?: string;
};

/** آیکن تخت؛ `danger` فقط برای خالیِ مخرب. */
const ICON_TONE_CLASS: Record<KvEmptyStateTone, string> = {
  muted: 'text-kv-empty-icon',
  danger: 'text-kv-danger',
};

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
        'flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center gap-kv-group px-kv-inset py-kv-block text-center',
        className
      )}
      role="status"
    >
      <div
        className={cn(
          'flex shrink-0 items-center justify-center',
          ICON_TONE_CLASS[tone]
        )}
        aria-hidden
      >
        <FaIcon icon={faIcons.xmark} size="xl" />
      </div>
      <div className="max-w-md space-y-kv-pair">
        <KvTypography variant="title" as="h2">
          {title}
        </KvTypography>
        {description ? (
          typeof description === 'string' ? (
            <KvTypography variant="body" tone="muted" as="p">
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
