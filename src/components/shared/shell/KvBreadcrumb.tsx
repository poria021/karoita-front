import Link from 'next/link';

import { KvTypography } from '@/components/shared/KvTypography';
import type { ModuleBreadcrumbItem } from '@/utils/moduleBreadcrumb';
import { cn } from '@/lib/utils';

export type KvBreadcrumbProps = {
  items: ModuleBreadcrumbItem[];
  className?: string;
};

export function KvBreadcrumb({ items, className }: KvBreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="مسیر صفحه" className={cn('min-w-0', className)} dir="ltr">
      <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const showLink = Boolean(item.href) && !isLast;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex min-w-0 items-center gap-x-1.5"
            >
              {index > 0 ? (
                <span
                  className="shrink-0 text-xs font-medium text-kv-text-faint"
                  aria-hidden
                >
                  /
                </span>
              ) : null}
              {showLink ? (
                <Link
                  href={item.href!}
                  className="min-w-0 truncate rounded-sm transition-colors hover:text-kv-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring"
                >
                  <KvTypography variant="caption" tone="muted" as="span" truncate>
                    {item.label}
                  </KvTypography>
                </Link>
              ) : (
                <span
                  className="min-w-0 truncate"
                  aria-current={isLast ? 'page' : undefined}
                >
                  <KvTypography
                    variant="caption"
                    tone="muted"
                    weight={isLast ? 'bold' : undefined}
                    as="span"
                    truncate
                  >
                    {item.label}
                  </KvTypography>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
