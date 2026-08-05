import type { OrgStructureSubTab } from '@/types/org-structure';
import type { KvTableAlign } from '@/components/shared/table/KvTable';

export type OrgStructureColumnKey =
  | 'name'
  | 'provinceName'
  | 'cityName'
  | 'districtName'
  | 'gender'
  | 'audience'
  | 'campusesCount'
  | 'districtsCount'
  | 'schoolsCount'
  | 'usersCount'
  | 'actions';

export type OrgStructureColumnDef = {
  key: OrgStructureColumnKey;
  label: string;
  align?: KvTableAlign;
  /** Suffix after Persian digits for count columns (e.g. «نفر»). */
  countSuffix?: string;
};

const COLUMNS_BY_TAB: Record<OrgStructureSubTab, OrgStructureColumnDef[]> = {
  provinces: [
    { key: 'name', label: 'نام استان' },
    { key: 'campusesCount', label: 'پردیس‌های متصل', align: 'center', countSuffix: 'واحد' },
    { key: 'districtsCount', label: 'مناطق تابعه', align: 'center', countSuffix: 'ناحیه' },
    { key: 'schoolsCount', label: 'مدارس همکار', align: 'center', countSuffix: 'مدرسه' },
    { key: 'usersCount', label: 'کل کاربران', align: 'center', countSuffix: 'نفر' },
    { key: 'actions', label: 'عملیات', align: 'center' },
  ],
  cities: [
    { key: 'name', label: 'نام شهر' },
    { key: 'provinceName', label: 'استان تابعه', align: 'center' },
    { key: 'schoolsCount', label: 'مدارس همکار', align: 'center', countSuffix: 'مدرسه' },
    { key: 'usersCount', label: 'کل کاربران', align: 'center', countSuffix: 'نفر' },
    { key: 'actions', label: 'عملیات', align: 'center' },
  ],
  districts: [
    { key: 'name', label: 'عنوان منطقه یا ناحیه' },
    { key: 'cityName', label: 'شهر تابعه', align: 'center' },
    { key: 'provinceName', label: 'استان تابعه', align: 'center' },
    { key: 'schoolsCount', label: 'مدارس همکار', align: 'center', countSuffix: 'واحد' },
    { key: 'usersCount', label: 'کل کاربران', align: 'center', countSuffix: 'نفر' },
    { key: 'actions', label: 'عملیات', align: 'center' },
  ],
  schools: [
    { key: 'name', label: 'نام مدرسه' },
    { key: 'gender', label: 'جنسیت', align: 'center' },
    { key: 'districtName', label: 'منطقه آموزشی', align: 'center' },
    { key: 'cityName', label: 'شهر تابعه', align: 'center' },
    { key: 'provinceName', label: 'استان تابعه', align: 'center' },
    { key: 'usersCount', label: 'کل کاربران', align: 'center', countSuffix: 'نفر' },
    { key: 'actions', label: 'عملیات', align: 'center' },
  ],
  majors: [
    { key: 'name', label: 'عنوان رشته تحصیلی' },
    { key: 'audience', label: 'نقش کاربری متصل', align: 'center' },
    { key: 'usersCount', label: 'کل کاربران', align: 'center', countSuffix: 'نفر' },
    { key: 'actions', label: 'عملیات', align: 'center' },
  ],
  faculties: [
    { key: 'name', label: 'نام پردیس / دانشکده' },
    { key: 'cityName', label: 'شهر تابعه', align: 'center' },
    { key: 'provinceName', label: 'استان تابعه', align: 'center' },
    { key: 'usersCount', label: 'کل کاربران', align: 'center', countSuffix: 'ناظر' },
    { key: 'actions', label: 'عملیات', align: 'center' },
  ],
};

export function getOrgStructureColumns(
  tab: OrgStructureSubTab
): OrgStructureColumnDef[] {
  return COLUMNS_BY_TAB[tab];
}
