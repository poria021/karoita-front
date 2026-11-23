import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import type { OrgStructureSubTab } from '@/types/org-structure';
import { faIcons } from '@/utils/iconMap';

export type OrgStructureCountMetric = {
  id: OrgStructureSubTab;
  label: string;
  count: number;
  icon: IconDefinition;
  /** رنگ قطاع نمودار حلقه‌ای. */
  color: string;
  softClassName: string;
  textClassName: string;
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

/** رنگ یکسان آیکون کارت‌ها — مثل بقیهٔ شمارنده‌های میز کار (`text-kv-brand`). */
const CARD_ICON_TONE = 'text-kv-brand-soft-fg';
const CARD_ICON_WRAP = 'bg-kv-brand-soft text-kv-brand-soft-fg';

const METRIC_META: Record<
  OrgStructureSubTab,
  Omit<OrgStructureCountMetric, 'id' | 'count'>
> = {
  provinces: {
    label: 'استان‌ها',
    icon: faIcons.map,
    color: 'var(--kv-brand)',
    softClassName: 'bg-kv-brand-soft',
    textClassName: 'text-kv-brand-soft-fg',
    toneClassName: CARD_ICON_TONE,
    iconWrapClassName: CARD_ICON_WRAP,
  },
  cities: {
    label: 'شهرها',
    icon: faIcons.buildingColumns,
    color: 'var(--kv-info)',
    softClassName: 'bg-kv-info-soft',
    textClassName: 'text-kv-info-soft-fg',
    toneClassName: CARD_ICON_TONE,
    iconWrapClassName: CARD_ICON_WRAP,
  },
  districts: {
    label: 'مناطق آموزشی',
    icon: faIcons.mapLocationDot,
    color: 'var(--kv-warning)',
    softClassName: 'bg-kv-warning-soft',
    textClassName: 'text-kv-warning-soft-fg',
    toneClassName: CARD_ICON_TONE,
    iconWrapClassName: CARD_ICON_WRAP,
  },
  schools: {
    label: 'مدارس تابعه',
    icon: faIcons.school,
    color: 'var(--kv-success)',
    softClassName: 'bg-kv-success-soft',
    textClassName: 'text-kv-success-soft-fg',
    toneClassName: CARD_ICON_TONE,
    iconWrapClassName: CARD_ICON_WRAP,
  },
  majors: {
    label: 'رشته‌های تحصیلی',
    icon: faIcons.graduationCap,
    color: 'var(--kv-violet)',
    softClassName: 'bg-kv-violet-soft',
    textClassName: 'text-kv-violet-soft-fg',
    toneClassName: CARD_ICON_TONE,
    iconWrapClassName: CARD_ICON_WRAP,
  },
  faculties: {
    label: 'دانشکده‌ها / پردیس‌ها',
    icon: faIcons.university,
    color: 'var(--kv-danger)',
    softClassName: 'bg-kv-danger-soft',
    textClassName: 'text-kv-danger-soft-fg',
    toneClassName: CARD_ICON_TONE,
    iconWrapClassName: CARD_ICON_WRAP,
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
