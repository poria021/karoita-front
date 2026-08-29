import type {
  OrgStructureEntityKind,
  OrgStructureListItem,
  OrgStructureSnapshot,
  OrgStructureSubTab,
} from '@/types/org-structure';

export type OrgDeleteBlockedSets = {
  provinces: Set<string>;
  cities: Set<string>;
  districts: Set<string>;
};

function addId(set: Set<string>, id: string | undefined): void {
  if (id) set.add(id);
}

export function buildOrgDeleteBlockedSets(
  db: OrgStructureSnapshot
): OrgDeleteBlockedSets {
  const provinces = new Set<string>();
  const cities = new Set<string>();
  const districts = new Set<string>();

  for (const city of db.cities) {
    addId(provinces, city.provinceId);
  }
  for (const faculty of db.faculties) {
    addId(provinces, faculty.provinceId);
    addId(cities, faculty.cityId);
  }
  for (const district of db.districts) {
    addId(provinces, district.provinceId);
    addId(cities, district.cityId);
  }
  for (const school of db.schools) {
    addId(provinces, school.provinceId);
    addId(cities, school.cityId);
    addId(districts, school.districtId);
  }

  return { provinces, cities, districts };
}

export function isDeleteBlockedWithSets(
  kind: OrgStructureEntityKind,
  id: string,
  sets: OrgDeleteBlockedSets
): boolean {
  if (kind === 'province') return sets.provinces.has(id);
  if (kind === 'city') return sets.cities.has(id);
  if (kind === 'district') return sets.districts.has(id);
  // faculty / school / major are leaf entities in the snapshot today —
  // nothing references them, so delete is always allowed. If a future
  // business rule needs to block one of these, add a Set for it above
  // and a branch here (see git history for the old always-false stub
  // functions this replaced: isFacultyDeleteBlocked, isSchoolDeleteBlocked,
  // isMajorDeleteBlocked — removed as dead code, none had any caller).
  return false;
}

/**
 * Single entry point for "can this row be deleted" — builds the blocked
 * sets fresh from the snapshot and checks `id` against them.
 *
 * Prefer `buildOrgDeleteBlockedSets` + `isDeleteBlockedWithSets` directly
 * when checking many ids against the same snapshot (e.g. an entire list
 * page) — that pattern computes the sets once and reuses them, instead of
 * re-scanning the whole snapshot per row the way this function does.
 */
export function isOrgEntityDeleteBlocked(
  kind: OrgStructureEntityKind,
  db: OrgStructureSnapshot,
  id: string
): boolean {
  return isDeleteBlockedWithSets(kind, id, buildOrgDeleteBlockedSets(db));
}

export function withDeleteBlocked(
  items: readonly OrgStructureListItem[],
  sets: OrgDeleteBlockedSets
): OrgStructureListItem[] {
  return items.map((row) => ({
    ...row,
    deleteBlocked: isDeleteBlockedWithSets(row.kind, row.id, sets),
  }));
}

export function orgDeleteBlockedMessage(
  kind: OrgStructureEntityKind
): string | null {
  if (kind === 'province') {
    return 'این استان به سایر واحدهای سازمانی متصل است و قابل حذف نیست.';
  }
  if (kind === 'city') {
    return 'این شهر به سایر واحدهای سازمانی متصل است و قابل حذف نیست.';
  }
  if (kind === 'district') {
    return 'این منطقه به مدارس متصل است و قابل حذف نیست.';
  }
  if (kind === 'faculty') return 'این پردیس قابل حذف نیست.';
  if (kind === 'school') return 'این مدرسه قابل حذف نیست.';
  return null;
}

export function orgTabNeedsDeleteBlockedIndex(
  tab: OrgStructureSubTab
): boolean {
  return tab === 'provinces' || tab === 'cities' || tab === 'districts';
}
