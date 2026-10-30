'use client';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';

type ComparativeEntityPickerProps = {
  entityLabel: string;
  pool: readonly string[];
  selectedIds: readonly string[];
  maxEntities: number;
  onToggle: (id: string) => void;
};

export function ComparativeEntityPicker({
  entityLabel,
  pool,
  selectedIds,
  maxEntities,
  onToggle,
}: ComparativeEntityPickerProps) {
  return (
    <section
      data-slot="comparative-entity-picker"
      className="rounded-kv-panel border border-kv-border bg-kv-surface"
    >
      <div className="flex items-center justify-between gap-kv-pair border-b border-kv-border px-kv-group py-kv-pair">
        <KvTypography variant="caption" weight="bold" as="h3">
          انتخاب {entityLabel} برای مقایسه
        </KvTypography>
        <KvTypography variant="caption" tone="muted" as="span">
          {toPersianDigits(selectedIds.length)} از{' '}
          {toPersianDigits(maxEntities)}
        </KvTypography>
      </div>
      <ul className="max-h-64 space-y-0 overflow-y-auto p-kv-pair">
        {pool.length === 0 ? (
          <li className="px-kv-pair py-kv-group text-center text-xs font-bold text-kv-text-faint">
            موجودیتی در محدوده فیلتر نیست
          </li>
        ) : (
          pool.map((id) => {
            const checked = selectedIds.includes(id);
            return (
              <li key={id}>
                <label
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-kv-pair rounded-kv-control px-kv-pair py-kv-pair hover:bg-kv-surface-muted',
                    checked && 'bg-kv-brand/10'
                  )}
                >
                  <span className="text-sm font-bold text-kv-text">{id}</span>
                  <input
                    type="checkbox"
                    className="size-4 accent-kv-brand"
                    checked={checked}
                    onChange={() => onToggle(id)}
                  />
                </label>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
