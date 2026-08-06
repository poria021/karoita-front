import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import type { OrganizationalCapacitiesSnapshot } from '@/types/organizational-capacities';
import { toPersianDigits } from '@/utils/persianDigits';

function formatCount(value: number | 'unlimited'): string {
  if (value === 'unlimited') return 'نامحدود';
  return `${toPersianDigits(value)} نفر`;
}

type OrganizationalCapacitiesSummaryProps = {
  summary: OrganizationalCapacitiesSnapshot['summary'];
};

export function OrganizationalCapacitiesSummary({
  summary,
}: OrganizationalCapacitiesSummaryProps) {
  const items = [
    { label: 'کل ظرفیت اعلام‌شده', value: formatCount(summary.total) },
    {
      label: 'پذیرش قطعی',
      value: `${toPersianDigits(summary.confirmed)} نفر`,
    },
    { label: 'باقی‌مانده', value: formatCount(summary.remaining) },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-kv-pair sm:gap-kv-group">
      {items.map((item) => (
        <KvCard key={item.label} tone="surface" padding="sm">
          <KvCardContent padding="none" className="space-y-kv-micro text-start">
            <KvTypography variant="caption" tone="muted" as="span">
              {item.label}
            </KvTypography>
            <KvTypography variant="subtitle" as="p">
              {item.value}
            </KvTypography>
          </KvCardContent>
        </KvCard>
      ))}
    </div>
  );
}
