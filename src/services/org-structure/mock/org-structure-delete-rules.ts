import type {
  OrgStructureEntityKind,
  OrgStructureSnapshot,
} from '@/types/org-structure';


export type OrgDeleteBlockedSets = {
  provinces: Set<string>;
  cities: Set<string>;
  districts: Set<string>;
};

export function buildOrgDeleteBlockedSets(
  db: OrgStructureSnapshot
): OrgDeleteBlockedSets {
  const provinces = new Set<string>();
  const cities = new Set<string>();
  const districts = new Set<string>();

  for (const city of db.cities) {
    provinces.add(city.provinceId);
  }
  for (const faculty of db.faculties) {
    provinces.add(faculty.provinceId);
    cities.add(faculty.cityId);
  }
  for (const district of db.districts) {
    provinces.add(district.provinceId);
    cities.add(district.cityId);
  }
  for (const school of db.schools) {
    provinces.add(school.provinceId);
    cities.add(school.cityId);
    districts.add(school.districtId);
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
