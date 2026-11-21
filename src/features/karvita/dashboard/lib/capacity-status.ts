import { CAPACITY_KIND_TABS } from '@/features/karvita/organizational-capacities/constants';
import type { OrganizationalCapacityKind } from '@/types/organizational-capacities';

export type CapacityFillTone = 'calm' | 'watch' | 'critical' | 'open';

export function kindLabel(kind: OrganizationalCapacityKind): string {
  return CAPACITY_KIND_TABS.find((tab) => tab.value === kind)?.label ?? kind;
}

/** ۰ تا ۱؛ برای نامحدود یا سقف صفر، null. */
export function computeFillRatio(
  total: number | 'unlimited',
  confirmed: number
): number | null {
  if (total === 'unlimited' || total <= 0) return null;
  return Math.min(1, Math.max(0, confirmed / total));
}

export function fillToneForRatio(ratio: number | null): CapacityFillTone {
  if (ratio == null) return 'open';
  if (ratio >= 0.95) return 'critical';
  if (ratio >= 0.75) return 'watch';
  return 'calm';
}
