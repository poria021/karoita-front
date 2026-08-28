import type { OrgStructureListItem } from '@/types/org-structure';

/**
 * GET /admin/schools and GET /admin/universites omit nested education/city
 * on list rows even after a successful write. The create/edit form knows
 * the labels at submit time — remember them so the post-save reload does
 * not flash the optimistic row then replace it with "—".
 *
 * Keys are entity id and/or title. Nested API titles still win when present.
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

/** Test-only: drop remembered labels so cases don't leak across files. */
export function resetOrgRelationLabelOverlay(): void {
  overlayByKey.clear();
}
