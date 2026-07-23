import type { ReactNode } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title?: string;
  description?: string;
  breadcrumb?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  icon,
  actions,
  className,
}: PageHeaderProps) {
  const startSlot =
    title || description || icon ? (
      <div className="flex min-w-0 items-center justify-start gap-kv-inline text-start">
        {icon ? (
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand/10 text-kv-brand-soft-fg"
            aria-hidden={typeof icon !== 'string'}
          >
            {icon}
          </div>
        ) : null}
        {title || description ? (
          <div className="flex min-w-0 flex-col items-start justify-center text-start">
            {title ? (
              <KvTypography variant="title" truncate>
                {title}
              </KvTypography>
            ) : null}
            {description ? (
              <div className={cn('min-w-0', title && 'mt-1')}>
                <KvTypography variant="caption" tone="muted">
                  {description}
                </KvTypography>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    ) : null;

  const endSlot =
    breadcrumb || actions ? (
      <div className="flex min-w-0 shrink-0 items-center justify-end gap-kv-inline">
        {breadcrumb}
        {actions}
      </div>
    ) : null;

  if (!startSlot && !endSlot) return null;

  return (
    <header
      className={cn(
        'flex flex-row items-center justify-between gap-kv-inline pb-kv-group',
        className
      )}
    >
      {startSlot}
      {endSlot}
    </header>
  );
}
