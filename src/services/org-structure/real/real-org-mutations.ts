import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import { invalidateRealBareListCache } from '@/services/org-structure/real/real-org-reads';
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
} from '@/services/org-structure/mock/mock-org-mutations';
import type { OrgStructureEntityKind } from '@/types/org-structure';

/** PUT /org-structure/provinces — real: POST/PATCH /api/admin/provinces */
export async function upsertRealProvince(
  input: UpsertProvinceInput,
  editId?: string
): Promise<void> {
  if (editId) {
    await adminCatalogApi.updateProvince(editId, { title: input.name });
  } else {
    await adminCatalogApi.createProvince({ title: input.name });
  }
  // کش typeahead استان را باطل کن تا resolve نام→id آپ‌تودیت بماند
  invalidateProvinceNameCache();
}

/** PUT /org-structure/cities — real: POST/PATCH /api/admin/cities */
export async function upsertRealCity(
  input: UpsertCityInput,
  editId?: string
): Promise<void> {
  if (editId) {
    await adminCatalogApi.updateCity(editId, { title: input.name });
  } else {
    await adminCatalogApi.createCity({
      title: input.name,
      province_id: input.provinceId,
    });
  }
}

/**
 * PUT /org-structure/faculties — real: POST/PUT /api/admin/universites.
 * The Nest entity is called "university" but is surfaced in this UI as
 * the دانشکده/پردیس (faculty) tab.
 */
export async function upsertRealFaculty(
  input: UpsertFacultyInput,
  editId?: string
): Promise<void> {
  if (editId) {
    await adminCatalogApi.updateUniversity(editId, {
      title: input.name,
      provinceId: input.provinceId,
      cityId: input.cityId,
    });
  } else {
    await adminCatalogApi.createUniversity({
      title: input.name,
      provinceId: input.provinceId,
      cityId: input.cityId,
    });
  }
  invalidateRealBareListCache('faculties');
}

/** PUT /org-structure/districts — real: POST/PUT /api/admin/educations */
export async function upsertRealDistrict(
  input: UpsertDistrictInput,
  editId?: string
): Promise<void> {
  // cityId is optional — only include when present so the API doesn't
  // reject an empty-string value with a 422.
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
  invalidateRealBareListCache('districts');
  // کش typeahead منطقه را باطل کن تا resolve نام→id آپ‌تودیت بماند
  invalidateDistrictNameCache();
}

/** PUT /org-structure/schools — real: POST/PUT /api/admin/schools */
export async function upsertRealSchool(
  input: UpsertSchoolInput,
  editId?: string
): Promise<void> {
  const gender = input.gender === 'female' ? 'Girl' : 'Boy';
  if (editId) {
    await adminCatalogApi.updateSchool(editId, {
      title: input.name,
      provinceId: input.provinceId,
      cityId: input.cityId,
      educationId: input.districtId,
      gender,
    });
  } else {
    await adminCatalogApi.createSchool({
      title: input.name,
      provinceId: input.provinceId,
      cityId: input.cityId,
      educationId: input.districtId,
      gender,
    });
  }
  invalidateRealBareListCache('schools');
}

/**
 * PUT /org-structure/majors — real: POST/PATCH /api/admin/degree.
 * Nest's degree DTO requires `roleId` (no direct "audience" concept —
 * that's a mock-only stand-in). Previously this silently no-op'd on
 * create in real mode: the optimistic row would show for a few seconds,
 * then vanish once the list reloaded from the server, because nothing
 * had actually been persisted.
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
  invalidateRealBareListCache('majors');
}

/** DELETE /org-structure/:kind/:id — real: DELETE /api/admin/{kind}/{id} */
export async function deleteRealEntity(
  kind: OrgStructureEntityKind,
  id: string
): Promise<void> {
  switch (kind) {
    case 'province':
      await adminCatalogApi.deleteProvince(id);
      invalidateProvinceNameCache();
      break;
    case 'city':
      await adminCatalogApi.deleteCity(id);
      break;
    case 'district':
      await adminCatalogApi.deleteEducation(id);
      invalidateRealBareListCache('districts');
      invalidateDistrictNameCache();
      break;
    case 'school':
      await adminCatalogApi.deleteSchool(id);
      invalidateRealBareListCache('schools');
      break;
    case 'faculty':
      await adminCatalogApi.deleteUniversity(id);
      invalidateRealBareListCache('faculties');
      break;
    case 'major':
      await adminCatalogApi.deleteDegree(id);
      invalidateRealBareListCache('majors');
      break;
  }
}
