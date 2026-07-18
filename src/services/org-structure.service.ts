import { isMockApiMode, REAL_MODE_NOT_IMPLEMENTED } from '@/lib/api-mode';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import { buildOrgStructureSeed } from '@/services/mock/org-structure-seed';
import type {
  OrgCity,
  OrgDistrict,
  OrgFaculty,
  OrgMajor,
  OrgProvince,
  OrgSchool,
  OrgSchoolGender,
  OrgStructureEntityKind,
  OrgStructureSnapshot,
  OrgStructureSubTab,
} from '@/types/org-structure';

/**
 * Facade for organizational structure CRUD (rule 40).
 * Mock: localStorage snapshot + client permission check (UX sim — NOT Nest authz).
 * Real: not wired yet — callers get REAL_MODE_NOT_IMPLEMENTED.
 */

const IS_MOCK_MODE = isMockApiMode();
/** Prefixed `mock_` so juniors do not confuse this key with a Nest/DB store. */
const STORAGE_KEY = 'karvita_mock_org_structure_v1';

/**
 * Mock-only gate: simulator mode + `organization.manage` on activeUser.
 * Browser role can be forged — Nest must re-check when real mode is wired.
 */
function requireMockOrgManage(): void {
  if (!isMockApiMode()) throw new Error(REAL_MODE_NOT_IMPLEMENTED);
  assertMockClientHasPermission('organization.manage');
}

export type OrgStructureListItem = {
  id: string;
  name: string;
  kind: OrgStructureEntityKind;
  /** When true, delete control must stay disabled. */
  deleteBlocked: boolean;
};

export type UpsertProvinceInput = { name: string };
export type UpsertCityInput = { name: string; provinceId: string };
export type UpsertFacultyInput = {
  name: string;
  provinceId: string;
  cityId: string;
};
export type UpsertDistrictInput = {
  name: string;
  provinceId: string;
  cityId: string;
};
export type UpsertSchoolInput = {
  name: string;
  provinceId: string;
  cityId: string;
  districtId: string;
  gender: OrgSchoolGender;
};
export type UpsertMajorInput = { name: string };

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function cloneSnapshot(data: OrgStructureSnapshot): OrgStructureSnapshot {
  return structuredClone(data);
}

function readSnapshot(): OrgStructureSnapshot {
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
      majors: parsed.majors ?? [],
    };
  } catch {
    const seed = buildOrgStructureSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return cloneSnapshot(seed);
  }
}

function writeSnapshot(data: OrgStructureSnapshot): void {
  if (!isBrowser()) return;
  if (!isMockApiMode()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function sortByNameFa<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, 'fa'));
}

function filterByName<T extends { name: string }>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => item.name.toLowerCase().includes(q));
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function assertUniqueName(
  items: Array<{ id: string; name: string }>,
  name: string,
  excludeId?: string
): void {
  const clean = name.trim();
  const clash = items.some(
    (item) => item.name === clean && item.id !== excludeId
  );
  if (clash) {
    throw new Error('این نام قبلاً در سامانه ثبت شده است.');
  }
}

function kindFromTab(tab: OrgStructureSubTab): OrgStructureEntityKind {
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

function isProvinceBlocked(db: OrgStructureSnapshot, id: string): boolean {
  return (
    db.cities.some((c) => c.provinceId === id) ||
    db.faculties.some((f) => f.provinceId === id) ||
    db.districts.some((d) => d.provinceId === id) ||
    db.schools.some((s) => s.provinceId === id)
  );
}

function isCityBlocked(db: OrgStructureSnapshot, id: string): boolean {
  return (
    db.faculties.some((f) => f.cityId === id) ||
    db.districts.some((d) => d.cityId === id) ||
    db.schools.some((s) => s.cityId === id)
  );
}

function isDistrictBlocked(db: OrgStructureSnapshot, id: string): boolean {
  return db.schools.some((s) => s.districtId === id);
}

function isFacultyBlocked(_db: OrgStructureSnapshot, _id: string): boolean {
  // Profile users may reference college by name — delete allowed in mock until Nest links ids.
  return false;
}

function isSchoolBlocked(_db: OrgStructureSnapshot, _id: string): boolean {
  return false;
}

function isMajorBlocked(_db: OrgStructureSnapshot, _id: string): boolean {
  return false;
}

export const OrgStructureService = {
  async getSnapshot(): Promise<OrgStructureSnapshot> {
    requireMockOrgManage();
    return cloneSnapshot(readSnapshot());
  },

  async listByTab(
    tab: OrgStructureSubTab,
    query = ''
  ): Promise<OrgStructureListItem[]> {
    requireMockOrgManage();
    const db = readSnapshot();
    const kind = kindFromTab(tab);

    if (tab === 'provinces') {
      return sortByNameFa(filterByName(db.provinces, query)).map((row) => ({
        id: row.id,
        name: row.name,
        kind,
        deleteBlocked: isProvinceBlocked(db, row.id),
      }));
    }
    if (tab === 'cities') {
      return sortByNameFa(filterByName(db.cities, query)).map((row) => ({
        id: row.id,
        name: row.name,
        kind,
        deleteBlocked: isCityBlocked(db, row.id),
      }));
    }
    if (tab === 'faculties') {
      return sortByNameFa(filterByName(db.faculties, query)).map((row) => ({
        id: row.id,
        name: row.name,
        kind,
        deleteBlocked: isFacultyBlocked(db, row.id),
      }));
    }
    if (tab === 'districts') {
      return sortByNameFa(filterByName(db.districts, query)).map((row) => ({
        id: row.id,
        name: row.name,
        kind,
        deleteBlocked: isDistrictBlocked(db, row.id),
      }));
    }
    if (tab === 'schools') {
      return sortByNameFa(filterByName(db.schools, query)).map((row) => ({
        id: row.id,
        name: row.name,
        kind,
        deleteBlocked: isSchoolBlocked(db, row.id),
      }));
    }
    return sortByNameFa(filterByName(db.majors, query)).map((row) => ({
      id: row.id,
      name: row.name,
      kind,
      deleteBlocked: isMajorBlocked(db, row.id),
    }));
  },

  async getEntity(
    kind: OrgStructureEntityKind,
    id: string
  ): Promise<
    | OrgProvince
    | OrgCity
    | OrgFaculty
    | OrgDistrict
    | OrgSchool
    | OrgMajor
    | null
  > {
    requireMockOrgManage();
    const db = readSnapshot();
    if (kind === 'province') return db.provinces.find((r) => r.id === id) ?? null;
    if (kind === 'city') return db.cities.find((r) => r.id === id) ?? null;
    if (kind === 'faculty') return db.faculties.find((r) => r.id === id) ?? null;
    if (kind === 'district') return db.districts.find((r) => r.id === id) ?? null;
    if (kind === 'school') return db.schools.find((r) => r.id === id) ?? null;
    return db.majors.find((r) => r.id === id) ?? null;
  },

  async listProvinces(): Promise<OrgProvince[]> {
    requireMockOrgManage();
    return sortByNameFa(readSnapshot().provinces);
  },

  async listCities(provinceId: string): Promise<OrgCity[]> {
    requireMockOrgManage();
    return sortByNameFa(
      readSnapshot().cities.filter((c) => c.provinceId === provinceId)
    );
  },

  async listDistricts(provinceId: string, cityId?: string): Promise<OrgDistrict[]> {
    requireMockOrgManage();
    return sortByNameFa(
      readSnapshot().districts.filter(
        (d) =>
          d.provinceId === provinceId && (!cityId || d.cityId === cityId)
      )
    );
  },

  /**
   * Label lists for profile selects — same mock source of truth.
   */
  listLabelsForField(
    field: 'province' | 'city' | 'college' | 'district' | 'school' | 'major',
    provinceName = '',
    districtName = ''
  ): string[] {
    if (!IS_MOCK_MODE) return [];
    const db = readSnapshot();
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
  },

  async upsertProvince(input: UpsertProvinceInput, editId?: string): Promise<void> {
    requireMockOrgManage();
    const db = readSnapshot();
    const name = input.name.trim();
    if (!name) throw new Error('نام استان الزامی است.');
    assertUniqueName(db.provinces, name, editId);
    if (editId) {
      db.provinces = db.provinces.map((p) =>
        p.id === editId ? { ...p, name } : p
      );
    } else {
      db.provinces.push({ id: newId('prov'), name });
    }
    writeSnapshot(db);
  },

  async upsertCity(input: UpsertCityInput, editId?: string): Promise<void> {
    requireMockOrgManage();
    const db = readSnapshot();
    const name = input.name.trim();
    if (!name) throw new Error('نام شهر الزامی است.');
    if (!db.provinces.some((p) => p.id === input.provinceId)) {
      throw new Error('استان انتخاب‌شده معتبر نیست.');
    }
    assertUniqueName(
      db.cities.filter((c) => c.provinceId === input.provinceId),
      name,
      editId
    );
    if (editId) {
      db.cities = db.cities.map((c) =>
        c.id === editId
          ? { ...c, name, provinceId: input.provinceId }
          : c
      );
    } else {
      db.cities.push({
        id: newId('city'),
        name,
        provinceId: input.provinceId,
      });
    }
    writeSnapshot(db);
  },

  async upsertFaculty(input: UpsertFacultyInput, editId?: string): Promise<void> {
    requireMockOrgManage();
    const db = readSnapshot();
    const name = input.name.trim();
    if (!name) throw new Error('نام پردیس الزامی است.');
    assertUniqueName(db.faculties, name, editId);
    if (editId) {
      db.faculties = db.faculties.map((f) =>
        f.id === editId
          ? {
              ...f,
              name,
              provinceId: input.provinceId,
              cityId: input.cityId,
            }
          : f
      );
    } else {
      db.faculties.push({
        id: newId('fac'),
        name,
        provinceId: input.provinceId,
        cityId: input.cityId,
      });
    }
    writeSnapshot(db);
  },

  async upsertDistrict(input: UpsertDistrictInput, editId?: string): Promise<void> {
    requireMockOrgManage();
    const db = readSnapshot();
    const name = input.name.trim();
    if (!name) throw new Error('نام منطقه الزامی است.');
    assertUniqueName(
      db.districts.filter((d) => d.provinceId === input.provinceId),
      name,
      editId
    );
    if (editId) {
      db.districts = db.districts.map((d) =>
        d.id === editId
          ? {
              ...d,
              name,
              provinceId: input.provinceId,
              cityId: input.cityId,
            }
          : d
      );
    } else {
      db.districts.push({
        id: newId('dist'),
        name,
        provinceId: input.provinceId,
        cityId: input.cityId,
      });
    }
    writeSnapshot(db);
  },

  async upsertSchool(input: UpsertSchoolInput, editId?: string): Promise<void> {
    requireMockOrgManage();
    const db = readSnapshot();
    const name = input.name.trim();
    if (!name) throw new Error('نام مدرسه الزامی است.');
    assertUniqueName(
      db.schools.filter((s) => s.districtId === input.districtId),
      name,
      editId
    );
    if (editId) {
      db.schools = db.schools.map((s) =>
        s.id === editId
          ? {
              ...s,
              name,
              provinceId: input.provinceId,
              cityId: input.cityId,
              districtId: input.districtId,
              gender: input.gender,
            }
          : s
      );
    } else {
      db.schools.push({
        id: newId('sch'),
        name,
        provinceId: input.provinceId,
        cityId: input.cityId,
        districtId: input.districtId,
        gender: input.gender,
      });
    }
    writeSnapshot(db);
  },

  async upsertMajor(input: UpsertMajorInput, editId?: string): Promise<void> {
    requireMockOrgManage();
    const db = readSnapshot();
    const name = input.name.trim();
    if (!name) throw new Error('نام رشته الزامی است.');
    assertUniqueName(db.majors, name, editId);
    if (editId) {
      db.majors = db.majors.map((m) =>
        m.id === editId ? { ...m, name } : m
      );
    } else {
      db.majors.push({ id: newId('maj'), name });
    }
    writeSnapshot(db);
  },

  async deleteEntity(kind: OrgStructureEntityKind, id: string): Promise<void> {
    requireMockOrgManage();
    const db = readSnapshot();

    if (kind === 'province') {
      if (isProvinceBlocked(db, id)) {
        throw new Error('این استان به سایر واحدهای سازمانی متصل است و قابل حذف نیست.');
      }
      db.provinces = db.provinces.filter((p) => p.id !== id);
    } else if (kind === 'city') {
      if (isCityBlocked(db, id)) {
        throw new Error('این شهر به سایر واحدهای سازمانی متصل است و قابل حذف نیست.');
      }
      db.cities = db.cities.filter((c) => c.id !== id);
    } else if (kind === 'faculty') {
      if (isFacultyBlocked(db, id)) {
        throw new Error('این پردیس قابل حذف نیست.');
      }
      db.faculties = db.faculties.filter((f) => f.id !== id);
    } else if (kind === 'district') {
      if (isDistrictBlocked(db, id)) {
        throw new Error('این منطقه به مدارس متصل است و قابل حذف نیست.');
      }
      db.districts = db.districts.filter((d) => d.id !== id);
    } else if (kind === 'school') {
      if (isSchoolBlocked(db, id)) {
        throw new Error('این مدرسه قابل حذف نیست.');
      }
      db.schools = db.schools.filter((s) => s.id !== id);
    } else {
      db.majors = db.majors.filter((m) => m.id !== id);
    }

    writeSnapshot(db);
  },
};
