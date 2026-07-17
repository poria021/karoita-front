import type { ReactNode } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';

export type KvEmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/**
 * Shared empty / coming-soon surface for dashboards and unfinished modules.
 * Presentation only — callers supply copy and optional actions.
 */
export function KvEmptyState({
  icon,
  title,
  description,
  actions,
  className,
}: KvEmptyStateProps) {
  return (
    <div
      data-slot="kv-empty-state"
      className={cn(
        'flex flex-col items-center justify-center gap-kv-group px-kv-inset py-kv-block text-center',
        className
      )}
      role="status"
    >
      {icon ? (
        <div className="flex size-12 items-center justify-center rounded-kv-panel bg-kv-brand-soft text-kv-brand-soft-fg shadow-kv-raised">
          {icon}
        </div>
      ) : null}
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
