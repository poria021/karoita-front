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
  return false;
}

/** Faculty/major lock when at least one user is linked. Tree children use the sets above. */
export function isLinkedUserDeleteBlocked(
  kind: OrgStructureEntityKind,
  usersCount: number | undefined
): boolean {
  if (kind !== 'faculty' && kind !== 'major') return false;
  return (usersCount ?? 0) > 0;
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
    deleteBlocked:
      isDeleteBlockedWithSets(row.kind, row.id, sets) ||
      isLinkedUserDeleteBlocked(row.kind, row.usersCount),
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
  if (kind === 'faculty') {
    return 'این دانشکده به کاربر متصل است و قابل حذف نیست.';
  }
  if (kind === 'major') {
    return 'این رشته به کاربر متصل است و قابل حذف نیست.';
  }
  if (kind === 'school') return 'این مدرسه قابل حذف نیست.';
  return null;
}

export function orgTabNeedsDeleteBlockedIndex(
  tab: OrgStructureSubTab
): boolean {
  return tab === 'provinces' || tab === 'cities' || tab === 'districts';
}
