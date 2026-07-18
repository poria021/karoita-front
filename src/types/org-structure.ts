/**
 * Organizational structure domain types (karvita admin).
 * Shapes mirror original-karvita.html `db.orgStructure` for Nest handover.
 */

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

export type OrgSchoolGender = 'male' | 'female' | 'mixed';

export interface OrgSchool {
  id: string;
  name: string;
  provinceId: string;
  cityId: string;
  districtId: string;
  gender: OrgSchoolGender;
}

export interface OrgMajor {
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
