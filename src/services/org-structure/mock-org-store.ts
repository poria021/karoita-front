import { isMockApiMode } from '@/lib/api-mode';
import { buildOrgStructureSeed } from '@/services/mock/org-structure-seed';
import {
  buildOrgDeleteBlockedSets,
  type OrgDeleteBlockedSets,
} from '@/services/org-structure-delete-rules';
import type {
  OrgCity,
  OrgDistrict,
  OrgFaculty,
  OrgMajor,
  OrgMajorAudience,
  OrgProvince,
  OrgSchool,
  OrgStructureEntityKind,
  OrgStructureSnapshot,
} from '@/types/org-structure';

const STORAGE_KEY = 'karvita_mock_org_structure_v3';

const VALID_MAJOR_AUDIENCES = new Set<OrgMajorAudience>([
  'student',
  'skill_learner',
  'supervisor_professor',
]);

function normalizeMajors(
  majors: Array<Partial<OrgMajor> & { id?: string; name?: string }> | undefined
): OrgMajor[] {
  if (!Array.isArray(majors)) return [];
  return majors
    .filter((row): row is Partial<OrgMajor> & { id: string; name: string } =>
      Boolean(row?.id && row?.name)
    )
    .map((row) => ({
      id: row.id,
      name: row.name,
      audience: VALID_MAJOR_AUDIENCES.has(row.audience as OrgMajorAudience)
        ? (row.audience as OrgMajorAudience)
        : 'student',
    }));
}

export type OrgEntityIdMaps = {
  province: Map<string, OrgProvince>;
  city: Map<string, OrgCity>;
  faculty: Map<string, OrgFaculty>;
  district: Map<string, OrgDistrict>;
  school: Map<string, OrgSchool>;
  major: Map<string, OrgMajor>;
};

export type OrgParentIndexes = {
  citiesByProvince: Map<string, OrgCity[]>;
  facultiesByProvince: Map<string, OrgFaculty[]>;
  districtsByProvince: Map<string, OrgDistrict[]>;
  districtsByCity: Map<string, OrgDistrict[]>;
  schoolsByDistrict: Map<string, OrgSchool[]>;
};

export type OrgRuntimeIndex = {
  revision: number;
  snapshot: OrgStructureSnapshot;
  deleteBlocked: OrgDeleteBlockedSets;
  byId: OrgEntityIdMaps;
  parents: OrgParentIndexes;
};

let revisionCounter = 0;
let runtime: OrgRuntimeIndex | null = null;

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function cloneSnapshot(
  data: OrgStructureSnapshot
): OrgStructureSnapshot {
  return structuredClone(data);
}

function indexById<T extends { id: string }>(rows: T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const row of rows) map.set(row.id, row);
  return map;
}

function groupBy<T>(rows: T[], keyOf: (row: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const key = keyOf(row);
    const bucket = map.get(key);
    if (bucket) bucket.push(row);
    else map.set(key, [row]);
  }
  return map;
}

export function buildOrgRuntimeIndex(
  snapshot: OrgStructureSnapshot
): OrgRuntimeIndex {
  revisionCounter += 1;
  return {
    revision: revisionCounter,
    snapshot,
    deleteBlocked: buildOrgDeleteBlockedSets(snapshot),
    byId: {
      province: indexById(snapshot.provinces),
      city: indexById(snapshot.cities),
      faculty: indexById(snapshot.faculties),
      district: indexById(snapshot.districts),
      school: indexById(snapshot.schools),
      major: indexById(snapshot.majors),
    },
    parents: {
      citiesByProvince: groupBy(snapshot.cities, (c) => c.provinceId),
      facultiesByProvince: groupBy(snapshot.faculties, (f) => f.provinceId),
      districtsByProvince: groupBy(snapshot.districts, (d) => d.provinceId),
      districtsByCity: groupBy(snapshot.districts, (d) => d.cityId),
      schoolsByDistrict: groupBy(snapshot.schools, (s) => s.districtId),
    },
  };
}

function loadSnapshotFromStorage(): OrgStructureSnapshot {
  if (!isBrowser()) return buildOrgStructureSeed();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = buildOrgStructureSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return cloneSnapshot(seed);
  }
  try {
    const parsed = JSON.parse(raw) as OrgStructureSnapshot;
    if (!parsed?.provinces || !Array.isArray(parsed.provinces)) {
      const seed = buildOrgStructureSeed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return cloneSnapshot(seed);
    }
    return {
      provinces: parsed.provinces ?? [],
      cities: parsed.cities ?? [],
      faculties: parsed.faculties ?? [],
      districts: parsed.districts ?? [],
      schools: parsed.schools ?? [],
      majors: normalizeMajors(parsed.majors),
    };
  } catch {
    const seed = buildOrgStructureSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return cloneSnapshot(seed);
  }
}

export function getOrgRuntime(): OrgRuntimeIndex {
  if (runtime) return runtime;
  runtime = buildOrgRuntimeIndex(loadSnapshotFromStorage());
  return runtime;
}

export function readOrgSnapshot(): OrgStructureSnapshot {
  return getOrgRuntime().snapshot;
}

export function writeOrgSnapshot(data: OrgStructureSnapshot): void {
  if (isBrowser() && isMockApiMode()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  runtime = buildOrgRuntimeIndex(cloneSnapshot(data));
  clearOrgListFilterCache();
}

export function getEntityById(
  kind: OrgStructureEntityKind,
  id: string
):
  | OrgProvince
  | OrgCity
  | OrgFaculty
  | OrgDistrict
  | OrgSchool
  | OrgMajor
  | undefined {
  const { byId } = getOrgRuntime();
  if (kind === 'province') return byId.province.get(id);
  if (kind === 'city') return byId.city.get(id);
  if (kind === 'faculty') return byId.faculty.get(id);
  if (kind === 'district') return byId.district.get(id);
  if (kind === 'school') return byId.school.get(id);
  return byId.major.get(id);
}

type OrgListFilterCache = {
  revision: number;
  tab: string;
  queryKey: string;
  rows: Array<{ id: string; name: string; audience?: OrgMajorAudience }>;
};

let listFilterCache: OrgListFilterCache | null = null;

export function getOrgListFilterCache(): OrgListFilterCache | null {
  return listFilterCache;
}

export function setOrgListFilterCache(entry: OrgListFilterCache): void {
  listFilterCache = entry;
}

export function clearOrgListFilterCache(): void {
  listFilterCache = null;
}

export function resetOrgRuntimeForTests(snapshot?: OrgStructureSnapshot): void {
  clearOrgListFilterCache();
  runtime = buildOrgRuntimeIndex(
    snapshot ? cloneSnapshot(snapshot) : buildOrgStructureSeed()
  );
}
