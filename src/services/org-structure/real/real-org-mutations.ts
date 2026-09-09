import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import { flushBareListCache } from '@/services/org-structure/real/real-org-reads';
import { assertRealOrgDeleteAllowed } from '@/services/org-structure/real/real-org-delete-blocked';
import {
  invalidateDistrictNameCache,
  invalidateProvinceNameCache,
} from '@/services/organization-options/organization-options-helpers';
import type {
  UpsertCityInput,
  UpsertDistrictInput,
  UpsertFacultyInput,
  UpsertMajorInput,
  UpsertProvinceInput,
  UpsertSchoolInput,
} from '@/types/org-structure';
import type { OrgStructureEntityKind } from '@/types/org-structure';

/**
 * POST/PATCH /admin/provinces.
 * کش typeahead و bareList جدا از react-query است — بدون flush، dropdown فرم‌های دیگر کهنه می‌ماند.
 */
export async function upsertRealProvince(
  input: UpsertProvinceInput,
  editId?: string
): Promise<void> {
  if (editId) {
    await adminCatalogApi.updateProvince(editId, { title: input.name });
  } else {
    await adminCatalogApi.createProvince({ title: input.name });
  }
  invalidateProvinceNameCache();
  flushBareListCache('provinces');
}

/**
 * POST/PATCH /admin/cities؛ بدون `province_id` در ویرایش Nest استان قبلی را بی‌خطا نگه می‌دارد.
 */
export async function upsertRealCity(
  input: UpsertCityInput,
  editId?: string
): Promise<void> {
  if (editId) {
    await adminCatalogApi.updateCity(editId, {
      title: input.name,
      province_id: input.provinceId,
    });
  } else {
    await adminCatalogApi.createCity({
      title: input.name,
      province_id: input.provinceId,
    });
  }
  // بدون flush، dropdown شهر در فرم منطقه/مدرسه کهنه می‌ماند.
  flushBareListCache('cities');
}

export async function upsertRealFaculty(
  input: UpsertFacultyInput,
  editId?: string
): Promise<void> {
  const cityId = input.cityId;
  if (editId) {
    await adminCatalogApi.updateUniversity(editId, {
      title: input.name,
      provinceId: input.provinceId,
      cityId,
    });
  } else {
    await adminCatalogApi.createUniversity({
      title: input.name,
      provinceId: input.provinceId,
      cityId,
    });
  }
  // invalidate نرم (`staleSince=0`) کافی نیست؛ reload ممکن است entry کهنه را بخواند.
  flushBareListCache('faculties');
}

/**
 * POST/PUT /admin/educations؛ `cityId` خالی را نفرست وگرنه ۴۲۲.
 */
export async function upsertRealDistrict(
  input: UpsertDistrictInput,
  editId?: string
): Promise<void> {
  const cityId = input.cityId || undefined;
  if (editId) {
    await adminCatalogApi.updateEducation(editId, {
      title: input.name,
      provinceId: input.provinceId,
      ...(cityId ? { cityId } : {}),
    });
  } else {
    await adminCatalogApi.createEducation({
      title: input.name,
      provinceId: input.provinceId,
      ...(cityId ? { cityId } : {}),
    });
  }
  flushBareListCache('districts');
  invalidateDistrictNameCache();
}

/**
 * POST/PUT /admin/schools؛ `educationId` خالی را نفرست؛ GET همچنان `education: {}` است.
 */
export async function upsertRealSchool(
  input: UpsertSchoolInput,
  editId?: string
): Promise<void> {
  // enum جنسیت Nest: 'Boy' | 'Girl'؛ نام فیلد در DTO لایو `genderType` است نه `gender`.
  const genderType = input.gender === 'female' ? 'Girl' : 'Boy';
  const cityId = input.cityId || undefined;
  const educationId = input.districtId || undefined;
  const body = {
    title: input.name,
    provinceId: input.provinceId,
    ...(cityId ? { cityId } : {}),
    ...(educationId ? { educationId } : {}),
    genderType,
  };
  if (editId) {
    await adminCatalogApi.updateSchool(editId, body);
  } else {
    await adminCatalogApi.createSchool(body);
  }
  flushBareListCache('schools');
}

/**
 * POST/PUT /admin/degree با `{ roleId, title }`؛ `audience` ماک روی Nest نیست.
 */
export async function upsertRealMajor(
  input: UpsertMajorInput,
  editId?: string
): Promise<void> {
  if (!input.roleId) {
    throw new Error('انتخاب نقش رشته الزامی است.');
  }
  if (editId) {
    await adminCatalogApi.updateDegree(editId, {
      title: input.name,
      roleId: input.roleId,
    });
  } else {
    await adminCatalogApi.createDegree({
      title: input.name,
      roleId: input.roleId,
    });
  }
  flushBareListCache('majors');
}

/** DELETE کاتالوگ Nest به‌ازای kind — مدرسه بدون `/` قبل از id. */
export async function deleteRealEntity(
  kind: OrgStructureEntityKind,
  id: string
): Promise<void> {
  await assertRealOrgDeleteAllowed(kind, id);
  switch (kind) {
    case 'province':
      await adminCatalogApi.deleteProvince(id);
      invalidateProvinceNameCache();
      flushBareListCache('provinces');
      break;
    case 'city':
      await adminCatalogApi.deleteCity(id);
      flushBareListCache('cities');
      break;
    case 'district':
      await adminCatalogApi.deleteEducation(id);
      flushBareListCache('districts');
      invalidateDistrictNameCache();
      break;
    case 'school':
      await adminCatalogApi.deleteSchool(id);
      flushBareListCache('schools');
      break;
    case 'faculty':
      await adminCatalogApi.deleteUniversity(id);
      flushBareListCache('faculties');
      break;
    case 'major':
      await adminCatalogApi.deleteDegree(id);
      flushBareListCache('majors');
      break;
  }
}
