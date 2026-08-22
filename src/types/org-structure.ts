
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
  districtId: string;
  gender: OrgSchoolGender;
}

/** Roles that pick a major in profile / onboarding. */
export type OrgMajorAudience =
  | 'student'
  | 'skill_learner'
  | 'supervisor_professor';

export interface OrgMajor {
  id: string;
  name: string;
  audience: OrgMajorAudience;
}

/** Nest role a degree/major links to (real mode only — GET /admin/roles). */
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
