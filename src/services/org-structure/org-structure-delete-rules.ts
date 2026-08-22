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

// Note: an `isOrgEntityDeleteBlocked(kind, db, id)` single-shot wrapper
// used to live here. It had no caller — every consumer (mock-org-query,
// mock-org-mutations) builds the sets once via `buildOrgDeleteBlockedSets`
// and reuses them across many rows via `isDeleteBlockedWithSets` directly —
// so it was removed as dead code rather than kept "just in case".
