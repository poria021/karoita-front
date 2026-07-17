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
        'flex flex-col gap-kv-inline border-b border-slate-200 pb-kv-stack sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-kv-inline">
        {icon ? (
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-kv-control bg-brand-500/10 text-brand-600"
            aria-hidden={typeof icon !== 'string'}
          >
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
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
