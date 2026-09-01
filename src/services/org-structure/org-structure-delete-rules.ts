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

/** قفل faculty/major وقتی حداقل یک کاربر وصل باشد؛ فرزندان درخت از sets بالا. */
export function isLinkedUserDeleteBlocked(
  kind: OrgStructureEntityKind,
  usersCount: number | undefined
): boolean {
  if (kind !== 'faculty' && kind !== 'major') return false;
  return (usersCount ?? 0) > 0;
}

/** یک id در برابر snapshot؛ برای کل صفحه sets را یک‌بار بساز و `isDeleteBlockedWithSets` را صدا بزن. */
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
