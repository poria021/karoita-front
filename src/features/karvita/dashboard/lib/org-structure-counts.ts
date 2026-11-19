import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import type { OrgStructureSubTab } from '@/types/org-structure';
import { faIcons } from '@/utils/iconMap';

export type OrgStructureCountMetric = {
  id: OrgStructureSubTab;
  label: string;
  count: number;
  icon: IconDefinition;
  /** کلاس‌های رنگ آیکون و پس‌زمینهٔ ملایم کارت. */
  toneClassName: string;
  iconWrapClassName: string;
};

const METRIC_ORDER: readonly OrgStructureSubTab[] = [
  'provinces',
  'cities',
  'districts',
  'schools',
  'majors',
  'faculties',
];

const METRIC_META: Record<
  OrgStructureSubTab,
  Omit<OrgStructureCountMetric, 'id' | 'count'>
> = {
  provinces: {
    label: 'استان‌ها',
    icon: faIcons.map,
    toneClassName: 'text-kv-brand-soft-fg',
    iconWrapClassName: 'bg-kv-brand-soft text-kv-brand-soft-fg',
  },
  cities: {
    label: 'شهرها',
    icon: faIcons.buildingColumns,
    toneClassName: 'text-kv-info-soft-fg',
    iconWrapClassName: 'bg-kv-info-soft text-kv-info-soft-fg',
  },
  districts: {
    label: 'مناطق آموزشی',
    icon: faIcons.mapLocationDot,
    toneClassName: 'text-kv-warning-soft-fg',
    iconWrapClassName: 'bg-kv-warning-soft text-kv-warning-soft-fg',
  },
  schools: {
    label: 'مدارس تابعه',
    icon: faIcons.school,
    toneClassName: 'text-kv-success-soft-fg',
    iconWrapClassName: 'bg-kv-success-soft text-kv-success-soft-fg',
  },
  majors: {
    label: 'رشته‌های تحصیلی',
    icon: faIcons.graduationCap,
    toneClassName: 'text-kv-brand-soft-fg',
    iconWrapClassName: 'bg-kv-brand-soft text-kv-brand-soft-fg',
  },
  faculties: {
    label: 'دانشکده‌ها / پردیس‌ها',
    icon: faIcons.university,
    toneClassName: 'text-kv-neutral-soft-fg',
    iconWrapClassName: 'bg-kv-neutral-soft text-kv-neutral-soft-fg',
  },
};

/** شمار هر تب ساختار سازمانی. */
export type OrgStructureCounts = Record<OrgStructureSubTab, number>;

/** از شمار آماده (API `users/dashboard/counts`) متریک‌های نمایشی می‌سازد. */
export function buildOrgStructureCountMetrics(
  counts: OrgStructureCounts | null | undefined
): OrgStructureCountMetric[] {
  if (!counts) return [];
  return METRIC_ORDER.map((id) => ({
    id,
    count: Math.max(0, counts[id] ?? 0),
    ...METRIC_META[id],
  }));
}

export function sumOrgStructureCounts(
  metrics: readonly OrgStructureCountMetric[]
): number {
  return metrics.reduce((sum, metric) => sum + metric.count, 0);
}
