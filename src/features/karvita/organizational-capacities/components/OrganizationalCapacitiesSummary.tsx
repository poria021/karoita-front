import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import { Spinner } from '@/components/ui/spinner';
import type { OrganizationalCapacitiesSnapshot } from '@/types/organizational-capacities';
import { toPersianDigits } from '@/utils/persianDigits';

function formatCount(value: number | 'unlimited'): string {
  if (value === 'unlimited') return 'نامحدود';
  return `${toPersianDigits(value)} نفر`;
}

type OrganizationalCapacitiesSummaryProps = {
  summary: OrganizationalCapacitiesSnapshot['summary'] | null;
  isLoading: boolean;
};

export function OrganizationalCapacitiesSummary({
  summary,
  isLoading,
}: OrganizationalCapacitiesSummaryProps) {
  const items = [
    {
      label: 'کل ظرفیت اعلام‌شده',
      value: summary ? formatCount(summary.total) : null,
    },
    {
      label: 'پذیرش قطعی',
      value: summary ? `${toPersianDigits(summary.confirmed)} نفر` : null,
    },
    {
      label: 'باقی‌مانده',
      value: summary ? formatCount(summary.remaining) : null,
    },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-kv-pair sm:gap-kv-group">
      {items.map((item) => (
        <KvCard key={item.label} tone="surface" padding="sm">
          <KvCardContent padding="none" className="flex flex-col gap-kv-micro text-start">
            <KvTypography variant="caption" tone="muted" as="p">
              {item.label}
            </KvTypography>
            <div className="flex h-7 min-h-7 items-center justify-start">
              {isLoading && item.value == null ? (
                <span
                  role="status"
                  aria-label={`در حال دریافت ${item.label}`}
                >
                  <Spinner className="size-4 text-kv-brand" aria-hidden="true" />
                </span>
              ) : (
                <KvTypography variant="subtitle" as="p">
                  {item.value ?? '—'}
                </KvTypography>
              )}
            </div>
          </KvCardContent>
        </KvCard>
      ))}
    </div>
  );
}
