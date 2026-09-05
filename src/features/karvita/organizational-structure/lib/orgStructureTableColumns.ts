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
  /** پسوند بعد از رقم فارسی برای ستون شمار (مثل «نفر»). */
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
    { key: 'name', label: 'نام منطقه یا ناحیه' },
    { key: 'provinceName', label: 'استان', align: 'center' },
    { key: 'cityName', label: 'شهر', align: 'center' },
    { key: 'schoolsCount', label: 'تعداد مدارس', align: 'center', countSuffix: 'مدرسه' },
    { key: 'usersCount', label: 'کل کاربران', align: 'center', countSuffix: 'نفر' },
    { key: 'actions', label: 'عملیات', align: 'center' },
  ],
  schools: [
    { key: 'name', label: 'نام مدرسه' },
    { key: 'gender', label: 'جنسیت', align: 'center' },
    { key: 'provinceName', label: 'استان', align: 'center' },
    { key: 'cityName', label: 'شهر', align: 'center' },
    { key: 'districtName', label: 'منطقه', align: 'center' },
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
    { key: 'name', label: 'نام دانشکده یا پردیس' },
    { key: 'provinceName', label: 'استان', align: 'center' },
    { key: 'cityName', label: 'شهر', align: 'center' },
    { key: 'usersCount', label: 'تعداد کاربران', align: 'center', countSuffix: 'نفر' },
    { key: 'actions', label: 'عملیات', align: 'center' },
  ],
};

export function getOrgStructureColumns(
  tab: OrgStructureSubTab
): OrgStructureColumnDef[] {
  return COLUMNS_BY_TAB[tab];
}
