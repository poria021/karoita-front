import { AUTH_MOCK_USERS } from '@/services/auth/mock/auth-mock-users';
import { buildOrgStructureSeed } from '@/services/org-structure/mock/org-structure.seed';
import {
  buildOrgDeleteBlockedSets,
  isDeleteBlockedWithSets,
  isLinkedUserDeleteBlocked,
} from '@/services/org-structure/org-structure-delete-rules';
import {
  orgEntityKindFromTab,
  type OrgCity,
  type OrgDistrict,
  type OrgMajorAudience,
  type OrgProvince,
  type OrgStructureEntity,
  type OrgStructureEntityKind,
  type OrgStructureListItem,
  type OrgStructureListPage,
  type OrgStructureSnapshot,
  type OrgStructureSubTab,
} from '@/types/org-structure';

/** داده‌ی ثابت mock — هیچ state یا ذخیره‌سازی‌ای ندارد؛ یک‌بار ساخته می‌شود. */
let cached: OrgStructureSnapshot | null = null;

function snapshot(): OrgStructureSnapshot {
  cached ??= buildOrgStructureSeed();
  return cached;
}

type NamedRow = { id: string; name: string; audience?: OrgMajorAudience };

function sortByNameFa<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, 'fa'));
}

function rowsForTab(db: OrgStructureSnapshot, tab: OrgStructureSubTab): NamedRow[] {
  if (tab === 'provinces') return db.provinces;
  if (tab === 'cities') return db.cities;
  if (tab === 'faculties') return db.faculties;
  if (tab === 'districts') return db.districts;
  if (tab === 'schools') return db.schools;
  return db.majors;
}

const USER_FIELD_BY_TAB = {
  provinces: 'province',
  cities: 'city',
  faculties: 'college',
  districts: 'district',
  schools: 'school',
  majors: 'major',
} as const;

function countUsers(tab: OrgStructureSubTab, name: string): number {
  const field = USER_FIELD_BY_TAB[tab];
  return AUTH_MOCK_USERS.filter((user) => {
    const value = user[field];
    return Array.isArray(value) ? value.includes(name) : value === name;
  }).length;
}

function enrich(
  db: OrgStructureSnapshot,
  tab: OrgStructureSubTab,
  row: NamedRow,
  blocked: ReturnType<typeof buildOrgDeleteBlockedSets>
): OrgStructureListItem {
  const kind = orgEntityKindFromTab(tab);
  const usersCount = countUsers(tab, row.name);
  const base: OrgStructureListItem = {
    id: row.id,
    name: row.name,
    kind,
    usersCount,
    deleteBlocked:
      isDeleteBlockedWithSets(kind, row.id, blocked) ||
      isLinkedUserDeleteBlocked(kind, usersCount),
  };
  const province = (id?: string) =>
    db.provinces.find((p) => p.id === id)?.name ?? '—';
  const city = (id?: string) => db.cities.find((c) => c.id === id)?.name ?? '—';
  const district = (id?: string) =>
    db.districts.find((d) => d.id === id)?.name ?? '—';

  if (tab === 'provinces') {
    return {
      ...base,
      campusesCount: db.faculties.filter((f) => f.provinceId === row.id).length,
      districtsCount: db.districts.filter((d) => d.provinceId === row.id).length,
      schoolsCount: db.schools.filter((s) => s.provinceId === row.id).length,
    };
  }
  if (tab === 'cities') {
    const item = db.cities.find((c) => c.id === row.id);
    return {
      ...base,
      provinceName: province(item?.provinceId),
      schoolsCount: db.schools.filter((s) => s.cityId === row.id).length,
    };
  }
  if (tab === 'faculties') {
    const item = db.faculties.find((f) => f.id === row.id);
    return {
      ...base,
      provinceName: province(item?.provinceId),
      cityName: city(item?.cityId),
    };
  }
  if (tab === 'districts') {
    const item = db.districts.find((d) => d.id === row.id);
    return {
      ...base,
      cityName: city(item?.cityId),
      provinceName: province(item?.provinceId),
      schoolsCount: db.schools.filter((s) => s.districtId === row.id).length,
    };
  }
  if (tab === 'schools') {
    const item = db.schools.find((s) => s.id === row.id);
    return {
      ...base,
      gender: item?.gender,
      districtName: item?.districtId ? district(item.districtId) : '—',
      cityName: city(item?.cityId),
      provinceName: province(item?.provinceId),
    };
  }
  return { ...base, ...(row.audience ? { audience: row.audience } : {}) };
}

export function mockOrgSnapshot(): OrgStructureSnapshot {
  const db = snapshot();
  return {
    provinces: db.provinces.map((x) => ({ ...x })),
    cities: db.cities.map((x) => ({ ...x })),
    faculties: db.faculties.map((x) => ({ ...x })),
    districts: db.districts.map((x) => ({ ...x })),
    schools: db.schools.map((x) => ({ ...x })),
    majors: db.majors.map((x) => ({ ...x })),
  };
}

export function mockOrgListPage(
  tab: OrgStructureSubTab,
  query: string,
  offset: number,
  limit: number
): OrgStructureListPage {
  const db = snapshot();
  const q = query.trim().toLowerCase();
  const filtered = sortByNameFa(
    rowsForTab(db, tab).filter((row) => !q || row.name.toLowerCase().includes(q))
  );
  const safeOffset = Math.max(0, Math.floor(offset));
  const safeLimit = Math.max(1, Math.floor(limit));
  const blocked = buildOrgDeleteBlockedSets(db);
  const items = filtered
    .slice(safeOffset, safeOffset + safeLimit)
    .map((row) => enrich(db, tab, row, blocked));
  return {
    items,
    total: filtered.length,
    hasMore: safeOffset + items.length < filtered.length,
  };
}

const COLLECTION_BY_KIND: Record<
  OrgStructureEntityKind,
  keyof OrgStructureSnapshot
> = {
  province: 'provinces',
  city: 'cities',
  faculty: 'faculties',
  district: 'districts',
  school: 'schools',
  major: 'majors',
};

export function mockOrgEntity(
  kind: OrgStructureEntityKind,
  id: string
): OrgStructureEntity | null {
  const rows = snapshot()[COLLECTION_BY_KIND[kind]] as OrgStructureEntity[];
  return rows.find((row) => row.id === id) ?? null;
}

export function mockOrgProvinces(): OrgProvince[] {
  return sortByNameFa(snapshot().provinces);
}

export function mockOrgCities(provinceId: string): OrgCity[] {
  return sortByNameFa(
    snapshot().cities.filter((c) => c.provinceId === provinceId)
  );
}

export function mockOrgDistricts(
  provinceId: string,
  cityId?: string
): OrgDistrict[] {
  return sortByNameFa(
    snapshot().districts.filter(
      (d) => d.provinceId === provinceId && (!cityId || d.cityId === cityId)
    )
  );
}

export function mockOrgLabelsForField(
  field: 'province' | 'city' | 'college' | 'district' | 'school' | 'major',
  provinceName = '',
  districtName = '',
  majorAudience?: OrgMajorAudience
): string[] {
  const db = snapshot();
  if (field === 'province') return sortByNameFa(db.provinces).map((p) => p.name);
  if (field === 'major') {
    const majors = majorAudience
      ? db.majors.filter((m) => m.audience === majorAudience)
      : db.majors;
    return sortByNameFa(majors).map((m) => m.name);
  }

  const province = db.provinces.find((p) => p.name === provinceName);
  if (!province) return [];
  const inProvince = <T extends { provinceId: string; name: string }>(
    rows: T[]
  ) =>
    sortByNameFa(rows.filter((r) => r.provinceId === province.id)).map(
      (r) => r.name
    );

  if (field === 'city') return inProvince(db.cities);
  if (field === 'college') return inProvince(db.faculties);
  if (field === 'district') return inProvince(db.districts);
  const district = db.districts.find(
    (d) => d.provinceId === province.id && d.name === districtName
  );
  if (!district) return [];
  return sortByNameFa(
    db.schools.filter((s) => s.districtId === district.id)
  ).map((s) => s.name);
}
