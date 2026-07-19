import type { ReactNode } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Eyebrow row: icon, title, optional description, and trailing actions. */
export function PageHeader({
  title,
  description,
  icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col items-stretch justify-start gap-kv-inline border-b border-kv-border-muted pb-kv-stack sm:flex-row sm:items-center sm:justify-between',
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
            <div className="mt-1">
              <KvTypography variant="caption" tone="muted">
                {description}
              </KvTypography>
            </div>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
