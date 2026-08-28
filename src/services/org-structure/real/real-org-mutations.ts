import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import {
  flushBareListCache,
  invalidateRealBareListCache,
} from '@/services/org-structure/real/real-org-reads';
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

/**
 * PUT /org-structure/provinces — real: POST/PATCH /api/admin/provinces.
 *
 * provinces از paginated endpoint می‌خونن (GET /admin/provinces با envelope
 * `{ data, hasNextPage }`) — react-query list cache توسط `invalidateAndReload`
 * در useOrgStructurePage باطل می‌شه. اینجا فقط typeahead cache و bareList را
 * flush می‌کنیم تا form-dropdown استان هم بعد از ایجاد/ویرایش به‌روز بشه.
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
  // typeahead cache استان را باطل کن (listRealProvinces → fetchAllNestProvinces).
  invalidateProvinceNameCache();
  // hard-flush تا form-dropdown استان در فرم‌های دیگر (شهر/منطقه/مدرسه) هم
  // بعد از ایجاد استان جدید، لیست تازه بگیره — این cache جدا از react-query است.
  flushBareListCache('provinces');
}

/**
 * PUT /org-structure/cities — real: POST/PATCH /api/admin/cities.
 *
 * cities هم paginated هستن. react-query list cache توسط `invalidateAndReload`
 * باطل می‌شه. `province_id` حتماً باید در edit هم ارسال بشه وگرنه Nest استان
 * قبلی شهر رو حفظ می‌کنه بدون خطا.
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
  // cities tab از paginated endpoint می‌خونه — react-query cache توسط
  // invalidateAndReload باطل می‌شه. bareList را flush کن تا dropdown شهر
  // در فرم‌های districts/schools بعد از ایجاد شهر جدید به‌روز بشه.
  flushBareListCache('cities');
}

/**
 * PUT /org-structure/faculties — real: POST/PUT /api/admin/universites.
 * The Nest entity is called "university" but is surfaced in this UI as
 * the دانشکده/پردیس (faculty) tab.
 *
 * faculties از bareListCache استفاده می‌کنن — hard-flush لازمه تا مطمئن بشیم
 * reload() که بلافاصله بعد از این صدا می‌شه از Nest داده تازه می‌گیره،
 * نه از entry ای که staleSince=0 شده ولی هنوز در Map هست.
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
  // Hard-flush برای تضمین freshness — invalidate نرم (staleSince=0) کافی نیست
  // چون reload() ممکنه قبل از اینکه fetch جدید بیاد از entry قدیمی بخونه.
  flushBareListCache('faculties');
}

/**
 * PUT /org-structure/districts — real: POST/PUT /api/admin/educations.
 *
 * cityId اختیاری است — فقط وقتی مقدار دارد ارسال می‌شه تا API خطای ۴۲۲
 * برای empty string برنگردونه.
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
  // Hard-flush برای تضمین freshness + typeahead منطقه آموزشی را باطل کن.
  flushBareListCache('districts');
  invalidateDistrictNameCache();
}

/**
 * PUT /org-structure/schools — real: POST/PUT /api/admin/schools
 *
 * Nest CreateSchoolDto requires educationId. Confirmed live: GET rows still
 * nest `education: {}`, but the write DTO field is `educationId`.
 */
export async function upsertRealSchool(
  input: UpsertSchoolInput,
  editId?: string
): Promise<void> {
  // Nest gender enum: 'Boy' | 'Girl'
  const gender = input.gender === 'female' ? 'Girl' : 'Boy';
  const body = {
    title: input.name,
    provinceId: input.provinceId,
    cityId: input.cityId,
    educationId: input.districtId!,
    gender,
  };
  if (editId) {
    await adminCatalogApi.updateSchool(editId, body);
  } else {
    await adminCatalogApi.createSchool(body);
  }
  // Hard-flush مدارس تا جدول بلافاصله داده تازه بگیره.
  flushBareListCache('schools');
}

/**
 * PUT /org-structure/majors — real: POST/PATCH /api/admin/degree.
 *
 * Nest's degree DTO requires `roleId` — the mock-only `audience` concept
 * has no equivalent on the server side. `roleId` must always be set.
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
  // Hard-flush رشته‌های تحصیلی تا جدول بعد از ذخیره داده تازه از Nest بگیره.
  flushBareListCache('majors');
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
