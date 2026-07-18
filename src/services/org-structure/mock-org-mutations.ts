import { isOrgEntityDeleteBlocked } from '@/services/org-structure-delete-rules';
import {
  readOrgSnapshot,
  writeOrgSnapshot,
} from '@/services/org-structure/mock-org-store';
import { sortByNameFa } from '@/services/org-structure/mock-org-query';
import type {
  OrgCity,
  OrgDistrict,
  OrgFaculty,
  OrgMajor,
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
  const db = readOrgSnapshot();
  if (kind === 'province') return db.provinces.find((r) => r.id === id) ?? null;
  if (kind === 'city') return db.cities.find((r) => r.id === id) ?? null;
  if (kind === 'faculty') return db.faculties.find((r) => r.id === id) ?? null;
  if (kind === 'district') return db.districts.find((r) => r.id === id) ?? null;
  if (kind === 'school') return db.schools.find((r) => r.id === id) ?? null;
  return db.majors.find((r) => r.id === id) ?? null;
}

export function mockListProvinces(): OrgProvince[] {
  return sortByNameFa(readOrgSnapshot().provinces);
}

export function mockListCities(provinceId: string): OrgCity[] {
  return sortByNameFa(
    readOrgSnapshot().cities.filter((c) => c.provinceId === provinceId)
  );
}

export function mockListDistricts(
  provinceId: string,
  cityId?: string
): OrgDistrict[] {
  return sortByNameFa(
    readOrgSnapshot().districts.filter(
      (d) => d.provinceId === provinceId && (!cityId || d.cityId === cityId)
    )
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
  writeOrgSnapshot(db);
}

export function mockUpsertMajor(input: UpsertMajorInput, editId?: string): void {
  const db = readOrgSnapshot();
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
  writeOrgSnapshot(db);
}

export function mockDeleteEntity(
  kind: OrgStructureEntityKind,
  id: string
): void {
  const db = readOrgSnapshot();

  if (kind === 'province') {
    if (isOrgEntityDeleteBlocked(kind, db, id)) {
      throw new Error(
        'این استان به سایر واحدهای سازمانی متصل است و قابل حذف نیست.'
      );
    }
    db.provinces = db.provinces.filter((p) => p.id !== id);
  } else if (kind === 'city') {
    if (isOrgEntityDeleteBlocked(kind, db, id)) {
      throw new Error(
        'این شهر به سایر واحدهای سازمانی متصل است و قابل حذف نیست.'
      );
    }
    db.cities = db.cities.filter((c) => c.id !== id);
  } else if (kind === 'faculty') {
    if (isOrgEntityDeleteBlocked(kind, db, id)) {
      throw new Error('این پردیس قابل حذف نیست.');
    }
    db.faculties = db.faculties.filter((f) => f.id !== id);
  } else if (kind === 'district') {
    if (isOrgEntityDeleteBlocked(kind, db, id)) {
      throw new Error('این منطقه به مدارس متصل است و قابل حذف نیست.');
    }
    db.districts = db.districts.filter((d) => d.id !== id);
  } else if (kind === 'school') {
    if (isOrgEntityDeleteBlocked(kind, db, id)) {
      throw new Error('این مدرسه قابل حذف نیست.');
    }
    db.schools = db.schools.filter((s) => s.id !== id);
  } else {
    db.majors = db.majors.filter((m) => m.id !== id);
  }

  writeOrgSnapshot(db);
}
