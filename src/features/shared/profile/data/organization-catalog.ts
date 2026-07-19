/**
 * Mock organization catalog for profile selects.
 * Used by {@link OrganizationOptionsService} in mock mode only.
 */

import type { OrganizationField } from '@/utils/roleFieldStrategy';

export type { OrganizationField };

interface OrganizationBranch {
  province: string;
  cities: string[];
  colleges: string[];
  districts: Array<{ name: string; schools: string[] }>;
}

const ORGANIZATION: OrganizationBranch[] = [
  {
    province: 'تهران',
    cities: ['تهران', 'ری', 'شمیرانات'],
    colleges: ['پردیس شهید باهنر تهران', 'دانشگاه فرهنگیان نسیبه تهران'],
    districts: [
      { name: 'ناحیه ۱ تهران', schools: ['دبیرستان ماندگار البرز', 'مدرسه فرهنگ'] },
      { name: 'ناحیه ۲ تهران', schools: ['دبیرستان شهید بهشتی', 'هنرستان آزادی'] },
    ],
  },
  {
    province: 'اصفهان',
    cities: ['اصفهان', 'کاشان', 'نجف‌آباد'],
    colleges: ['پردیس شهید باهنر اصفهان', 'مرکز آموزش عالی کاشان'],
    districts: [
      { name: 'ناحیه ۱ اصفهان', schools: ['دبیرستان سعدی', 'هنرستان امیرکبیر'] },
      { name: 'ناحیه ۲ اصفهان', schools: ['دبیرستان صارمیه', 'مدرسه ادب'] },
    ],
  },
  {
    province: 'فارس',
    cities: ['شیراز', 'مرودشت', 'جهرم'],
    colleges: ['پردیس شهید رجایی فارس', 'مرکز آموزش عالی شیراز'],
    districts: [
      { name: 'ناحیه ۱ شیراز', schools: ['دبیرستان نمازی', 'هنرستان دستغیب'] },
      { name: 'ناحیه ۲ شیراز', schools: ['دبیرستان توحید', 'مدرسه ملاصدرا'] },
    ],
  },
  {
    province: 'خراسان رضوی',
    cities: ['مشهد', 'نیشابور', 'سبزوار'],
    colleges: ['پردیس شهید بهشتی مشهد', 'مرکز آموزش عالی نیشابور'],
    districts: [
      { name: 'ناحیه ۱ مشهد', schools: ['دبیرستان هاشمیه', 'هنرستان رضوی'] },
      { name: 'ناحیه ۲ مشهد', schools: ['دبیرستان امام رضا', 'مدرسه فرهنگ'] },
    ],
  },
  {
    province: 'آذربایجان شرقی',
    cities: ['تبریز', 'مراغه', 'مرند'],
    colleges: ['پردیس علامه امینی تبریز', 'مرکز آموزش عالی مراغه'],
    districts: [
      { name: 'ناحیه ۱ تبریز', schools: ['دبیرستان فردوسی', 'هنرستان نجات'] },
      { name: 'ناحیه ۲ تبریز', schools: ['دبیرستان پروین', 'مدرسه رشد'] },
    ],
  },
  {
    province: 'کرمان',
    cities: ['کرمان', 'رفسنجان', 'سیرجان'],
    colleges: ['پردیس شهید باهنر کرمان', 'مرکز آموزش عالی سیرجان'],
    districts: [
      { name: 'ناحیه ۱ کرمان', schools: ['دبیرستان ایرانشهر', 'هنرستان باهنر'] },
    ],
  },
  {
    province: 'خوزستان',
    cities: ['اهواز', 'آبادان', 'دزفول'],
    colleges: ['پردیس فاطمه الزهرا اهواز', 'مرکز آموزش عالی آبادان'],
    districts: [
      { name: 'ناحیه ۱ اهواز', schools: ['دبیرستان دکتر حسابی', 'هنرستان کارون'] },
    ],
  },
  {
    province: 'قم',
    cities: ['قم'],
    colleges: ['پردیس حضرت معصومه قم'],
    districts: [{ name: 'ناحیه ۱ قم', schools: ['دبیرستان صدوق', 'مدرسه امام صادق'] }],
  },
  {
    province: 'البرز',
    cities: ['کرج', 'نظرآباد', 'هشتگرد'],
    colleges: ['پردیس امیرکبیر کرج', 'مرکز آموزش عالی نظرآباد'],
    districts: [
      { name: 'ناحیه ۱ کرج', schools: ['دبیرستان شهید رجایی', 'هنرستان البرز'] },
    ],
  },
  {
    province: 'گیلان',
    cities: ['رشت', 'انزلی', 'لاهیجان'],
    colleges: ['پردیس امام علی رشت', 'مرکز آموزش عالی لاهیجان'],
    districts: [
      { name: 'ناحیه ۱ رشت', schools: ['دبیرستان شهید بهشتی', 'هنرستان کاسپین'] },
    ],
  },
  {
    province: 'مازندران',
    cities: ['ساری', 'بابل', 'آمل'],
    colleges: ['پردیس دکتر شریعتی ساری', 'مرکز آموزش عالی بابل'],
    districts: [
      { name: 'ناحیه ۱ ساری', schools: ['دبیرستان فرح‌آباد', 'هنرستان شمال'] },
    ],
  },
  {
    province: 'یزد',
    cities: ['یزد', 'اردکان', 'میبد'],
    colleges: ['پردیس فاطمه الزهرا یزد'],
    districts: [
      { name: 'ناحیه ۱ یزد', schools: ['دبیرستان ایرانشهر', 'مدرسه کاظمیه'] },
    ],
  },
];

const MAJORS = [
  'آموزش ابتدایی',
  'دبیری زبان و ادبیات فارسی',
  'دبیری ریاضی',
  'دبیری علوم تجربی',
  'آموزش فنی و حرفه‌ای',
  'مشاوره تحصیلی',
  'آموزش زبان انگلیسی',
  'تربیت بدنی',
  'کار و فناوری',
  'علوم اجتماعی',
  'تاریخ',
  'جغرافیا',
];

/** Full label list for a field, optionally scoped by cascade parents. */
export function listOrganizationLabels(
  field: OrganizationField,
  province: string,
  district: string
): string[] {
  if (field === 'province') return ORGANIZATION.map((item) => item.province);
  if (field === 'major') return MAJORS;

  const branch = ORGANIZATION.find((item) => item.province === province);
  if (!branch) return [];
  if (field === 'city') return branch.cities;
  if (field === 'college') return branch.colleges;
  if (field === 'district') return branch.districts.map((item) => item.name);
  return branch.districts.find((item) => item.name === district)?.schools ?? [];
}
