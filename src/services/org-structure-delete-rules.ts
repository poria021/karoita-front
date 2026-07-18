import type {
  OrgStructureEntityKind,
  OrgStructureSnapshot,
} from '@/types/org-structure';

/**
 * Pure domain rules: when delete must stay blocked in org-structure mock/real.
 * Kept outside the Facade so unit tests do not need localStorage / Zustand.
 */

export function isProvinceDeleteBlocked(
  db: OrgStructureSnapshot,
  id: string
): boolean {
  return (
    db.cities.some((c) => c.provinceId === id) ||
    db.faculties.some((f) => f.provinceId === id) ||
    db.districts.some((d) => d.provinceId === id) ||
    db.schools.some((s) => s.provinceId === id)
  );
}

export function isCityDeleteBlocked(
  db: OrgStructureSnapshot,
  id: string
): boolean {
  return (
    db.faculties.some((f) => f.cityId === id) ||
    db.districts.some((d) => d.cityId === id) ||
    db.schools.some((s) => s.cityId === id)
  );
}

export function isDistrictDeleteBlocked(
  db: OrgStructureSnapshot,
  id: string
): boolean {
  return db.schools.some((s) => s.districtId === id);
}

export function isFacultyDeleteBlocked(
  _db: OrgStructureSnapshot,
  _id: string
): boolean {
  // Profile users may reference college by name — delete allowed until Nest links ids.
  return false;
}

export function isSchoolDeleteBlocked(
  _db: OrgStructureSnapshot,
  _id: string
): boolean {
  return false;
}

export function isMajorDeleteBlocked(
  _db: OrgStructureSnapshot,
  _id: string
): boolean {
  return false;
}

export function isOrgEntityDeleteBlocked(
  kind: OrgStructureEntityKind,
  db: OrgStructureSnapshot,
  id: string
): boolean {
  if (kind === 'province') return isProvinceDeleteBlocked(db, id);
  if (kind === 'city') return isCityDeleteBlocked(db, id);
  if (kind === 'district') return isDistrictDeleteBlocked(db, id);
  if (kind === 'faculty') return isFacultyDeleteBlocked(db, id);
  if (kind === 'school') return isSchoolDeleteBlocked(db, id);
  return isMajorDeleteBlocked(db, id);
}
