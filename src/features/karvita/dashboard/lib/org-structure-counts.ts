import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import type {
  OrgStructureSnapshot,
  OrgStructureSubTab,
} from '@/types/org-structure';
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

function countForTab(
  snapshot: OrgStructureSnapshot,
  tab: OrgStructureSubTab
): number {
  switch (tab) {
    case 'provinces':
      return snapshot.provinces.length;
    case 'cities':
      return snapshot.cities.length;
    case 'districts':
      return snapshot.districts.length;
    case 'schools':
      return snapshot.schools.length;
    case 'majors':
      return snapshot.majors.length;
    case 'faculties':
      return snapshot.faculties.length;
  }
}

export function buildOrgStructureCountMetrics(
  snapshot: OrgStructureSnapshot | null | undefined
): OrgStructureCountMetric[] {
  if (!snapshot) return [];
  return METRIC_ORDER.map((id) => ({
    id,
    count: countForTab(snapshot, id),
    ...METRIC_META[id],
  }));
}

export function sumOrgStructureCounts(
  metrics: readonly OrgStructureCountMetric[]
): number {
  return metrics.reduce((sum, metric) => sum + metric.count, 0);
}
