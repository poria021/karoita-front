import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';

import { WEEK_LEGEND_ITEMS } from '../constants';

export function DailyApprovalWeekLegend({
  titled = false,
}: {
  titled?: boolean;
}) {
  return (
    <div
      className={cn(
        titled &&
          'space-y-kv-group rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group shadow-kv-raised'
      )}
    >
      {titled ? (
        <KvTypography variant="overline" as="span">
          راهنمای وضعیت گزارشات کلاسی:
        </KvTypography>
      ) : null}
      <div
        className={cn(
          'flex flex-wrap items-center gap-x-kv-group gap-y-kv-pair border-t border-kv-border pt-kv-group text-xs font-bold text-kv-text-faint',
          titled && 'grid grid-cols-2 border-t-0 pt-0'
        )}
      >
        {WEEK_LEGEND_ITEMS.map((item) => (
          <span key={item.label} className="flex items-center gap-kv-pair">
            <span
              className={cn(
                'flex size-5 items-center justify-center rounded-kv-control border shadow-kv-raised',
                item.wellClass
              )}
            >
              <FaIcon icon={item.icon} size="2xs" />
            </span>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
