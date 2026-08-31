import { readMockUsers } from '@/services/auth/mock/mock-auth.store';
import {
  isDeleteBlockedWithSets,
  isLinkedUserDeleteBlocked,
  orgDeleteBlockedMessage,
} from '@/services/org-structure/org-structure-delete-rules';
import {
  getEntityById,
  getOrgRuntime,
  readOrgSnapshot,
  writeOrgSnapshot,
} from '@/services/org-structure/mock/mock-org-store';
import { sortByNameFa } from '@/services/org-structure/mock/mock-org-query';
import type {
  OrgCity,
  OrgDistrict,
  OrgFaculty,
  OrgMajor,
  OrgMajorAudience,
  OrgProvince,
  OrgSchool,
  OrgSchoolGender,
  OrgStructureEntityKind,
} from '@/types/org-structure';

export type UpsertProvinceInput = { name: string };
export type UpsertCityInput = { name: string; provinceId: string };
export type UpsertFacultyInput = {
  name: string;
  provinceId: string;
  /** Optional — same as district/school; omit when the faculty has no city. */
  cityId?: string;
};
export type UpsertDistrictInput = {
  name: string;
  provinceId: string;
  /** Optional: provinces that have no cities yield province-level districts. */
  cityId?: string;
};
export type UpsertSchoolInput = {
  name: string;
  provinceId: string;
  /** Optional — same as district/faculty; omit when the school has no city. */
  cityId?: string;
  /** منطقه آموزشی اختیاری است. */
  districtId?: string;
  gender: OrgSchoolGender;
};
export type UpsertMajorInput = {
  name: string;
  /** Mock-mode only — required by mockUpsertMajor below. */
  audience?: OrgMajorAudience;
  /** Real-mode only — required by OrgStructureService.upsertMajor's Nest branch. */
  roleId?: string;
};

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

function assertUniqueMajorNameForAudience(
  items: OrgMajor[],
  name: string,
  audience: OrgMajorAudience,
  excludeId?: string
): void {
  const clean = name.trim();
  const clash = items.some(
    (item) =>
      item.name === clean &&
      item.audience === audience &&
      item.id !== excludeId
  );
  if (clash) {
    throw new Error('این رشته برای این مخاطب قبلاً ثبت شده است.');
  }
}

export function mockGetEntity(
  kind: OrgStructureEntityKind,
  id: string
):
  | OrgProvince
  | OrgCity
  | OrgFaculty
  | OrgDistrict
  | OrgSchool
  | OrgMajor
  | null {
  return getEntityById(kind, id) ?? null;
}

export function mockListProvinces(): OrgProvince[] {
  return sortByNameFa(readOrgSnapshot().provinces);
}

export function mockListCities(provinceId: string): OrgCity[] {
  return sortByNameFa(
    getOrgRuntime().parents.citiesByProvince.get(provinceId) ?? []
  );
}

export function mockListDistricts(
  provinceId: string,
  cityId?: string
): OrgDistrict[] {
  const runtime = getOrgRuntime();
  if (cityId) {
    return sortByNameFa(
      (runtime.parents.districtsByCity.get(cityId) ?? []).filter(
        (d) => d.provinceId === provinceId
      )
    );
  }
  return sortByNameFa(
    runtime.parents.districtsByProvince.get(provinceId) ?? []
  );
}

export function mockUpsertProvince(
  input: UpsertProvinceInput,
  editId?: string
): void {
  const db = readOrgSnapshot();
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
  writeOrgSnapshot(db);
}

export function mockUpsertCity(input: UpsertCityInput, editId?: string): void {
  const db = readOrgSnapshot();
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
      c.id === editId ? { ...c, name, provinceId: input.provinceId } : c
    );
  } else {
    db.cities.push({
      id: newId('city'),
      name,
      provinceId: input.provinceId,
    });
  }
  writeOrgSnapshot(db);
}

export function mockUpsertFaculty(
  input: UpsertFacultyInput,
  editId?: string
): void {
  const db = readOrgSnapshot();
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
            cityId: input.cityId ?? '',
          }
        : f
    );
  } else {
    db.faculties.push({
      id: newId('fac'),
      name,
      provinceId: input.provinceId,
      cityId: input.cityId ?? '',
    });
  }
  writeOrgSnapshot(db);
}

export function mockUpsertDistrict(
  input: UpsertDistrictInput,
  editId?: string
): void {
  const db = readOrgSnapshot();
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
            cityId: input.cityId ?? '',
          }
        : d
    );
  } else {
    db.districts.push({
      id: newId('dist'),
      name,
      provinceId: input.provinceId,
      cityId: input.cityId ?? '',
    });
  }
  writeOrgSnapshot(db);
}

export function mockUpsertSchool(
  input: UpsertSchoolInput,
  editId?: string
): void {
  const db = readOrgSnapshot();
  const name = input.name.trim();
  if (!name) throw new Error('نام مدرسه الزامی است.');
  assertUniqueName(
    db.schools.filter((s) => (s.districtId ?? '') === (input.districtId ?? '')),
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
            cityId: input.cityId ?? '',
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
      cityId: input.cityId ?? '',
      districtId: input.districtId,
      gender: input.gender,
    });
  }
  writeOrgSnapshot(db);
}

export function mockUpsertMajor(input: UpsertMajorInput, editId?: string): void {
  const db = readOrgSnapshot();
  const name = input.name.trim();
  if (!name) throw new Error('نام رشته الزامی است.');
  if (!input.audience) throw new Error('انتخاب مخاطب رشته الزامی است.');
  // narrowing نوع audience داخل closureهای map/push از دست می‌رود؛ در یک متغیر محلی نگه می‌داریم.
  const audience = input.audience;
  assertUniqueMajorNameForAudience(db.majors, name, audience, editId);
  if (editId) {
    db.majors = db.majors.map((m) =>
      m.id === editId ? { ...m, name, audience } : m
    );
  } else {
    db.majors.push({ id: newId('maj'), name, audience });
  }
  writeOrgSnapshot(db);
}

function mockLinkedUserCount(
  kind: OrgStructureEntityKind,
  id: string
): number {
  const entity = getEntityById(kind, id);
  if (!entity) return 0;
  const name = entity.name;
  let count = 0;
  for (const user of readMockUsers()) {
    if (kind === 'faculty') {
      const college = user.college;
      if (Array.isArray(college) ? college.includes(name) : college === name) {
        count += 1;
      }
    } else if (kind === 'major' && user.major === name) {
      count += 1;
    }
  }
  return count;
}

export function mockDeleteEntity(
  kind: OrgStructureEntityKind,
  id: string
): void {
  const runtime = getOrgRuntime();
  const db = runtime.snapshot;
  const blocked =
    isDeleteBlockedWithSets(kind, id, runtime.deleteBlocked) ||
    isLinkedUserDeleteBlocked(kind, mockLinkedUserCount(kind, id));

  if (blocked) {
    const message = orgDeleteBlockedMessage(kind);
    if (message) throw new Error(message);
  }

  if (kind === 'province') {
    db.provinces = db.provinces.filter((p) => p.id !== id);
  } else if (kind === 'city') {
    db.cities = db.cities.filter((c) => c.id !== id);
  } else if (kind === 'faculty') {
    db.faculties = db.faculties.filter((f) => f.id !== id);
  } else if (kind === 'district') {
    db.districts = db.districts.filter((d) => d.id !== id);
  } else if (kind === 'school') {
    db.schools = db.schools.filter((s) => s.id !== id);
  } else {
    db.majors = db.majors.filter((m) => m.id !== id);
  }

  writeOrgSnapshot(db);
}
