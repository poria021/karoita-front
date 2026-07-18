import {
  buildOrgDeleteBlockedSets,
  isDeleteBlockedWithSets,
} from '@/services/org-structure-delete-rules';
import { readOrgSnapshot } from '@/services/org-structure/mock-org-store';
import type {
  OrgStructureEntityKind,
  OrgStructureSnapshot,
  OrgStructureSubTab,
} from '@/types/org-structure';
import {
  DEFAULT_PAGE_LIMIT,
  type OffsetLimitPage,
} from '@/utils/offset-limit-page';

export type OrgStructureListItem = {
  id: string;
  name: string;
  kind: OrgStructureEntityKind;
  deleteBlocked: boolean;
};

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

export function kindFromTab(tab: OrgStructureSubTab): OrgStructureEntityKind {
  const map: Record<OrgStructureSubTab, OrgStructureEntityKind> = {
    provinces: 'province',
    cities: 'city',
    districts: 'district',
    schools: 'school',
    majors: 'major',
    faculties: 'faculty',
  };
  return map[tab];
}

type NamedRow = { id: string; name: string };

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

/**
 * Filter + sort once; attach deleteBlocked only for the requested page slice
 * using a single-pass blocked-id index (not per-row child scans).
 */
export function pageOrgRows(
  db: OrgStructureSnapshot,
  tab: OrgStructureSubTab,
  query: string,
  offset: number,
  limit: number = DEFAULT_PAGE_LIMIT
): OrgStructureListPage {
  const kind = kindFromTab(tab);
  const blocked = buildOrgDeleteBlockedSets(db);

  const filtered = sortByNameFa(filterByName(rawRowsForTab(db, tab), query));
  const total = filtered.length;
  const safeOffset = Math.max(0, Math.floor(offset));
  const safeLimit = Math.max(1, Math.floor(limit));
  const pageRows = filtered.slice(safeOffset, safeOffset + safeLimit);

  const items: OrgStructureListItem[] = pageRows.map((row) => ({
    id: row.id,
    name: row.name,
    kind,
    deleteBlocked: isDeleteBlockedWithSets(kind, row.id, blocked),
  }));

  return {
    items,
    total,
    hasMore: safeOffset + items.length < total,
  };
}

export function queryOrgListPage(
  tab: OrgStructureSubTab,
  query: string,
  offset: number,
  limit: number = DEFAULT_PAGE_LIMIT
): OrgStructureListPage {
  return pageOrgRows(readOrgSnapshot(), tab, query, offset, limit);
}

/** Full list for legacy callers — still uses indexed deleteBlocked. */
export function queryOrgListAll(
  tab: OrgStructureSubTab,
  query = ''
): OrgStructureListItem[] {
  const page = queryOrgListPage(tab, query, 0, Number.MAX_SAFE_INTEGER);
  return page.items;
}

export function listLabelsForField(
  field: 'province' | 'city' | 'college' | 'district' | 'school' | 'major',
  provinceName = '',
  districtName = ''
): string[] {
  const db = readOrgSnapshot();
  if (field === 'province') return sortByNameFa(db.provinces).map((p) => p.name);
  if (field === 'major') return sortByNameFa(db.majors).map((m) => m.name);

  const province = db.provinces.find((p) => p.name === provinceName);
  if (!province) return [];

  if (field === 'city') {
    return sortByNameFa(
      db.cities.filter((c) => c.provinceId === province.id)
    ).map((c) => c.name);
  }
  if (field === 'college') {
    return sortByNameFa(
      db.faculties.filter((f) => f.provinceId === province.id)
    ).map((f) => f.name);
  }
  if (field === 'district') {
    return sortByNameFa(
      db.districts.filter((d) => d.provinceId === province.id)
    ).map((d) => d.name);
  }
  const district = db.districts.find(
    (d) => d.name === districtName && d.provinceId === province.id
  );
  if (!district) return [];
  return sortByNameFa(
    db.schools.filter((s) => s.districtId === district.id)
  ).map((s) => s.name);
}
