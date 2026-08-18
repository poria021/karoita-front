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
  return false;
}

export function isProvinceDeleteBlocked(
  db: OrgStructureSnapshot,
  id: string
): boolean {
  return buildOrgDeleteBlockedSets(db).provinces.has(id);
}

export function isCityDeleteBlocked(
  db: OrgStructureSnapshot,
  id: string
): boolean {
  return buildOrgDeleteBlockedSets(db).cities.has(id);
}

export function isDistrictDeleteBlocked(
  db: OrgStructureSnapshot,
  id: string
): boolean {
  return buildOrgDeleteBlockedSets(db).districts.has(id);
}

export function isFacultyDeleteBlocked(
  db: OrgStructureSnapshot,
  id: string
): boolean {
  void db;
  void id;
  return false;
}

export function isSchoolDeleteBlocked(
  db: OrgStructureSnapshot,
  id: string
): boolean {
  void db;
  void id;
  return false;
}

export function isMajorDeleteBlocked(
  db: OrgStructureSnapshot,
  id: string
): boolean {
  void db;
  void id;
  return false;
}

export function isOrgEntityDeleteBlocked(
  kind: OrgStructureEntityKind,
  db: OrgStructureSnapshot,
  id: string
): boolean {
  return isDeleteBlockedWithSets(kind, id, buildOrgDeleteBlockedSets(db));
}
