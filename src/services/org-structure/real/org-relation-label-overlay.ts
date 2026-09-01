import type { OrgStructureListItem } from '@/types/org-structure';

/**
 * GET مدرسه/پردیس education/city تو در تو را نمی‌دهد؛ برچسب فرم را به خاطر بسپار تا reload «—» نشان ندهد.
 */
export type OrgRelationLabelOverlay = {
  provinceName?: string;
  cityName?: string;
  districtName?: string;
  roleName?: string;
};

const overlayByKey = new Map<string, OrgRelationLabelOverlay>();

export function rememberOrgRelationLabels(
  keys: Array<string | undefined>,
  labels: OrgRelationLabelOverlay
): void {
  for (const key of keys) {
    const trimmed = key?.trim();
    if (!trimmed) continue;
    overlayByKey.set(trimmed, {
      ...overlayByKey.get(trimmed),
      ...labels,
    });
  }
}

export function overlayOrgRelationLabels(
  row: OrgStructureListItem
): OrgStructureListItem {
  const labels = overlayByKey.get(row.id) ?? overlayByKey.get(row.name);
  if (!labels) return row;
  return {
    ...row,
    provinceName: row.provinceName || labels.provinceName,
    cityName: row.cityName || labels.cityName,
    districtName: row.districtName || labels.districtName,
    roleName: row.roleName || labels.roleName,
  };
}

/** فقط تست: برچسب‌های به‌خاطر سپرده را پاک کن تا کیس‌ها نشت نکنند. */
export function resetOrgRelationLabelOverlay(): void {
  overlayByKey.clear();
}
