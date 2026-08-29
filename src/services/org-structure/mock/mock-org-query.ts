import { readMockUsers } from '@/services/auth/mock/mock-auth.store';
import {
  isDeleteBlockedWithSets,
  isLinkedUserDeleteBlocked,
} from '@/services/org-structure/org-structure-delete-rules';
import {
  buildOrgRuntimeIndex,
  clearOrgListFilterCache,
  getOrgListFilterCache,
  getOrgRuntime,
  setOrgListFilterCache,
  type OrgRuntimeIndex,
} from '@/services/org-structure/mock/mock-org-store';
import {
  orgEntityKindFromTab,
  type OrgMajorAudience,
  type OrgStructureListItem,
  type OrgStructureSnapshot,
  type OrgStructureSubTab,
} from '@/types/org-structure';
import {
  DEFAULT_PAGE_LIMIT,
  type OffsetLimitPage,
} from '@/utils/offset-limit-page';

// OrgStructureListItem is now defined in @/types/org-structure and re-exported here for backward compat.
export type { OrgStructureListItem };

export type OrgStructureListPage = OffsetLimitPage<OrgStructureListItem>;

export function sortByNameFa<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, 'fa'));
}

export function filterByName<T extends { name: string }>(
  items: T[],
  query: string
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => item.name.toLowerCase().includes(q));
}

export const kindFromTab = orgEntityKindFromTab;

type NamedRow = {
  id: string;
  name: string;
  audience?: OrgMajorAudience;
};

type UserCountIndexes = {
  byProvince: Map<string, number>;
  byCity: Map<string, number>;
  byCollege: Map<string, number>;
  byDistrict: Map<string, number>;
  bySchool: Map<string, number>;
  byMajor: Map<string, number>;
};

function bumpCount(
  map: Map<string, number>,
  key: string | string[] | undefined
): void {
  if (Array.isArray(key)) {
    for (const item of key) bumpCount(map, item);
    return;
  }
  if (!key) return;
  map.set(key, (map.get(key) ?? 0) + 1);
}

export function buildOrgUserCountIndexes(
  users: ReadonlyArray<{
    province?: string;
    city?: string;
    college?: string | string[];
    district?: string;
    school?: string;
    major?: string;
  }>
): UserCountIndexes {
  const indexes: UserCountIndexes = {
    byProvince: new Map(),
    byCity: new Map(),
    byCollege: new Map(),
    byDistrict: new Map(),
    bySchool: new Map(),
    byMajor: new Map(),
  };
  for (const user of users) {
    bumpCount(indexes.byProvince, user.province);
    bumpCount(indexes.byCity, user.city);
    bumpCount(indexes.byCollege, user.college);
    bumpCount(indexes.byDistrict, user.district);
    bumpCount(indexes.bySchool, user.school);
    bumpCount(indexes.byMajor, user.major);
  }
  return indexes;
}

function countOf(map: Map<string, number>, key: string | undefined): number {
  if (!key) return 0;
  return map.get(key) ?? 0;
}

function rawRowsForTab(
  db: OrgStructureSnapshot,
  tab: OrgStructureSubTab
): NamedRow[] {
  if (tab === 'provinces') return db.provinces;
  if (tab === 'cities') return db.cities;
  if (tab === 'faculties') return db.faculties;
  if (tab === 'districts') return db.districts;
  if (tab === 'schools') return db.schools;
  return db.majors;
}

export function getFilteredSortedRows(
  runtime: OrgRuntimeIndex,
  tab: OrgStructureSubTab,
  query: string
): NamedRow[] {
  const queryKey = query.trim().toLowerCase();
  const cached = getOrgListFilterCache();
  if (
    cached &&
    cached.revision === runtime.revision &&
    cached.tab === tab &&
    cached.queryKey === queryKey
  ) {
    return cached.rows;
  }

  const rows = sortByNameFa(
    filterByName(rawRowsForTab(runtime.snapshot, tab), query)
  );
  setOrgListFilterCache({
    revision: runtime.revision,
    tab,
    queryKey,
    rows,
  });
  return rows;
}

function enrichListItem(
  runtime: OrgRuntimeIndex,
  tab: OrgStructureSubTab,
  row: NamedRow,
  users: UserCountIndexes
): OrgStructureListItem {
  const kind = kindFromTab(tab);
  const usersCount = (() => {
    if (tab === 'provinces') return countOf(users.byProvince, row.name);
    if (tab === 'cities') return countOf(users.byCity, row.name);
    if (tab === 'faculties') return countOf(users.byCollege, row.name);
    if (tab === 'districts') return countOf(users.byDistrict, row.name);
    if (tab === 'schools') return countOf(users.bySchool, row.name);
    return countOf(users.byMajor, row.name);
  })();
  const base: OrgStructureListItem = {
    id: row.id,
    name: row.name,
    kind,
    usersCount,
    deleteBlocked:
      isDeleteBlockedWithSets(kind, row.id, runtime.deleteBlocked) ||
      isLinkedUserDeleteBlocked(kind, usersCount),
  };

  if (tab === 'provinces') {
    return {
      ...base,
      campusesCount: runtime.parents.facultiesByProvince.get(row.id)?.length ?? 0,
      districtsCount: runtime.parents.districtsByProvince.get(row.id)?.length ?? 0,
      schoolsCount: runtime.parents.schoolsByProvince.get(row.id)?.length ?? 0,
    };
  }

  if (tab === 'cities') {
    const city = runtime.byId.city.get(row.id);
    const provinceName = city
      ? runtime.byId.province.get(city.provinceId)?.name
      : undefined;
    return {
      ...base,
      provinceName: provinceName ?? '—',
      schoolsCount: runtime.parents.schoolsByCity.get(row.id)?.length ?? 0,
    };
  }

  if (tab === 'faculties') {
    const faculty = runtime.byId.faculty.get(row.id);
    return {
      ...base,
      provinceName: faculty
        ? (runtime.byId.province.get(faculty.provinceId)?.name ?? '—')
        : '—',
    };
  }

  if (tab === 'districts') {
    const district = runtime.byId.district.get(row.id);
    return {
      ...base,
      cityName: district
        ? (runtime.byId.city.get(district.cityId)?.name ?? '—')
        : '—',
      provinceName: district
        ? (runtime.byId.province.get(district.provinceId)?.name ?? '—')
        : '—',
      schoolsCount: runtime.parents.schoolsByDistrict.get(row.id)?.length ?? 0,
    };
  }

  if (tab === 'schools') {
    const school = runtime.byId.school.get(row.id);
    return {
      ...base,
      gender: school?.gender,
      districtName: school?.districtId
        ? (runtime.byId.district.get(school.districtId)?.name ?? '—')
        : '—',
      cityName: school
        ? (runtime.byId.city.get(school.cityId)?.name ?? '—')
        : '—',
      provinceName: school
        ? (runtime.byId.province.get(school.provinceId)?.name ?? '—')
        : '—',
    };
  }

  return {
    ...base,
    ...(row.audience ? { audience: row.audience } : {}),
  };
}

export function pageOrgRowsFromRuntime(
  runtime: OrgRuntimeIndex,
  tab: OrgStructureSubTab,
  query: string,
  offset: number,
  limit: number = DEFAULT_PAGE_LIMIT,
  userCounts: UserCountIndexes = buildOrgUserCountIndexes(readMockUsers())
): OrgStructureListPage {
  const filtered = getFilteredSortedRows(runtime, tab, query);
  const total = filtered.length;
  const safeOffset = Math.max(0, Math.floor(offset));
  const safeLimit = Math.max(1, Math.floor(limit));
  const pageRows = filtered.slice(safeOffset, safeOffset + safeLimit);

  const items: OrgStructureListItem[] = pageRows.map((row) =>
    enrichListItem(runtime, tab, row, userCounts)
  );

  return {
    items,
    total,
    hasMore: safeOffset + items.length < total,
  };
}

export function pageOrgRows(
  db: OrgStructureSnapshot,
  tab: OrgStructureSubTab,
  query: string,
  offset: number,
  limit: number = DEFAULT_PAGE_LIMIT,
  userCounts?: UserCountIndexes
): OrgStructureListPage {
  clearOrgListFilterCache();
  const runtime = buildOrgRuntimeIndex(db);
  return pageOrgRowsFromRuntime(
    runtime,
    tab,
    query,
    offset,
    limit,
    userCounts ?? buildOrgUserCountIndexes([])
  );
}

export function queryOrgListPage(
  tab: OrgStructureSubTab,
  query: string,
  offset: number,
  limit: number = DEFAULT_PAGE_LIMIT
): OrgStructureListPage {
  return pageOrgRowsFromRuntime(getOrgRuntime(), tab, query, offset, limit);
}

export function listLabelsForField(
  field: 'province' | 'city' | 'college' | 'district' | 'school' | 'major',
  provinceName = '',
  districtName = '',
  majorAudience?: OrgMajorAudience
): string[] {
  const runtime = getOrgRuntime();
  const db = runtime.snapshot;
  if (field === 'province') return sortByNameFa(db.provinces).map((p) => p.name);
  if (field === 'major') {
    const majors = majorAudience
      ? db.majors.filter((m) => m.audience === majorAudience)
      : db.majors;
    return sortByNameFa(majors).map((m) => m.name);
  }

  const province = db.provinces.find((p) => p.name === provinceName);
  if (!province) return [];

  if (field === 'city') {
    return sortByNameFa(
      runtime.parents.citiesByProvince.get(province.id) ?? []
    ).map((c) => c.name);
  }
  if (field === 'college') {
    return sortByNameFa(
      runtime.parents.facultiesByProvince.get(province.id) ?? []
    ).map((f) => f.name);
  }
  if (field === 'district') {
    return sortByNameFa(
      runtime.parents.districtsByProvince.get(province.id) ?? []
    ).map((d) => d.name);
  }
  const district = (runtime.parents.districtsByProvince.get(province.id) ?? []).find(
    (d) => d.name === districtName
  );
  if (!district) return [];
  return sortByNameFa(
    runtime.parents.schoolsByDistrict.get(district.id) ?? []
  ).map((s) => s.name);
}
