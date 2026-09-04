
export type OrgStructureEntityKind =
  | 'province'
  | 'city'
  | 'district'
  | 'school'
  | 'major'
  | 'faculty';

export type OrgStructureSubTab =
  | 'provinces'
  | 'cities'
  | 'districts'
  | 'schools'
  | 'majors'
  | 'faculties';

const ORG_TAB_TO_KIND: Record<OrgStructureSubTab, OrgStructureEntityKind> = {
  provinces: 'province',
  cities: 'city',
  districts: 'district',
  schools: 'school',
  majors: 'major',
  faculties: 'faculty',
};

export function orgEntityKindFromTab(
  tab: OrgStructureSubTab
): OrgStructureEntityKind {
  return ORG_TAB_TO_KIND[tab];
}

export interface OrgProvince {
  id: string;
  name: string;
}

export interface OrgCity {
  id: string;
  name: string;
  provinceId: string;
}

export interface OrgFaculty {
  id: string;
  name: string;
  provinceId: string;
  cityId: string;
}

export interface OrgDistrict {
  id: string;
  name: string;
  provinceId: string;
  cityId: string;
}

export type OrgSchoolGender = 'male' | 'female';

export interface OrgSchool {
  id: string;
  name: string;
  provinceId: string;
  cityId: string;
  /** منطقه آموزشی اختیاری است — برخی مدارس بدون منطقه ثبت می‌شوند. */
  districtId?: string;
  gender: OrgSchoolGender;
}

/** نقش‌هایی که در پروفایل/آنبوردینگ رشته انتخاب می‌کنند. */
export type OrgMajorAudience =
  | 'student'
  | 'skill_learner'
  | 'supervisor_professor';

export interface OrgMajor {
  id: string;
  name: string;
  audience: OrgMajorAudience;
}

/** نقش Nest که رشته به آن وصل است (فقط real — GET /admin/roles). */
export interface OrgRole {
  id: string;
  name: string;
}

export interface OrgStructureSnapshot {
  provinces: OrgProvince[];
  cities: OrgCity[];
  faculties: OrgFaculty[];
  districts: OrgDistrict[];
  schools: OrgSchool[];
  majors: OrgMajor[];
}

export type OrgStructureEntity =
  | OrgProvince
  | OrgCity
  | OrgFaculty
  | OrgDistrict
  | OrgSchool
  | OrgMajor;

/**
 * ردیف جدول ساختار سازمانی — هم mock و هم real از این type استفاده می‌کنند.
 * نگه داشتن اینجا جلوی وابستگی real-mode به mock-mode را می‌گیرد.
 */
export type OrgStructureListItem = {
  id: string;
  name: string;
  kind: OrgStructureEntityKind;
  deleteBlocked: boolean;
  audience?: OrgMajorAudience;
  /** حالت real: عنوان نمایشی نقش وصل‌شده (ببین NestDegree). */
  roleName?: string;
  gender?: OrgSchoolGender;
  provinceName?: string;
  cityName?: string;
  districtName?: string;
  campusesCount?: number;
  districtsCount?: number;
  schoolsCount?: number;
  usersCount?: number;
  provinceId?: string;
  cityId?: string;
  districtId?: string;
  /** حالت real: id نقش وصل‌شده برای پیش‌پر کردن فرم ویرایش. */
  roleId?: string;
};

export type OrgStructureListPage = {
  items: OrgStructureListItem[];
  total: number;
  hasMore: boolean;
};

export type UpsertProvinceInput = { name: string };
export type UpsertCityInput = { name: string; provinceId: string };
export type UpsertFacultyInput = {
  name: string;
  provinceId: string;
  /** فرم پردیس شهر ندارد؛ لایهٔ real در صورت نیاز پر می‌کند. */
  cityId?: string;
};
export type UpsertDistrictInput = {
  name: string;
  provinceId: string;
  /** اختیاری: استان بدون شهر، منطقه در سطح استان می‌سازد. */
  cityId?: string;
};
export type UpsertSchoolInput = {
  name: string;
  provinceId: string;
  /** اختیاری مثل منطقه/پردیس — مدرسه بدون شهر. */
  cityId?: string;
  /** منطقه آموزشی اختیاری است. */
  districtId?: string;
  gender: OrgSchoolGender;
};
export type UpsertMajorInput = {
  name: string;
  /** فقط mock — `mockUpsertMajor` لازم دارد. */
  audience?: OrgMajorAudience;
  /** فقط real — شاخهٔ Nest در `OrgStructureService.upsertMajor`. */
  roleId?: string;
};
