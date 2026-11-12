import type { ReactNode } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title?: string;
  /** کنار عنوان (مثلاً بج ماکت). */
  titleAddon?: ReactNode;
  description?: string;
  breadcrumb?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  titleAddon,
  description,
  breadcrumb,
  icon,
  actions,
  className,
}: PageHeaderProps) {
  const startSlot =
    title || description || icon || titleAddon ? (
      <div className="flex min-w-0 items-center justify-start gap-kv-inline text-start">
        {icon ? (
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand/10 text-kv-brand-soft-fg"
            aria-hidden={typeof icon !== 'string'}
          >
            {icon}
          </div>
        ) : null}
        {title || description || titleAddon ? (
          <div className="flex min-w-0 flex-col items-start justify-center text-start">
            {title || titleAddon ? (
              <div className="flex min-w-0 max-w-full items-center gap-kv-pair">
                {title ? (
                  <KvTypography variant="title" truncate>
                    {title}
                  </KvTypography>
                ) : null}
                {titleAddon}
              </div>
            ) : null}
            {description ? (
              <div className={cn('min-w-0', (title || titleAddon) && 'mt-1')}>
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
        // عنوان و بردکرامب بلند روی موبایل روی هم نیفتند؛ بردکرامب به خط بعد می‌رود.
        'flex flex-row flex-wrap items-center justify-between gap-x-kv-inline gap-y-kv-pair pb-kv-group',
        className
      )}
    >
      {startSlot}
      {endSlot}
    </header>
  );
}
