import type { ReactNode } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
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
  const endSlot =
    breadcrumb || actions ? (
      <div className="flex shrink-0 flex-wrap items-center justify-start gap-kv-inline sm:justify-end">
        {breadcrumb}
        {actions}
      </div>
    ) : null;

  return (
    <header
      className={cn(
        'flex flex-col items-stretch justify-start gap-kv-inline border-b border-kv-border pb-kv-stack sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex min-w-0 items-start justify-start gap-kv-inline text-start">
        {icon ? (
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand/10 text-kv-brand-soft-fg"
            aria-hidden={typeof icon !== 'string'}
          >
            {icon}
          </div>
        ) : null}
        <div className="flex min-w-0 flex-col items-start justify-start text-start">
          <KvTypography variant="title" truncate>
            {title}
          </KvTypography>
          {description ? (
            <div className="mt-1 min-w-0">
              <KvTypography variant="caption" tone="muted">
                {description}
              </KvTypography>
            </div>
          ) : null}
        </div>
      </div>
      {endSlot}
    </header>
  );
}
