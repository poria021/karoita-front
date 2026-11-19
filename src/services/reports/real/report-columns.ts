import type { ReportSlug } from '@/types/report-access';
import type { ReportColumnDef, ReportPeriodMode } from '@/types/reports';

/** عنوان ستون شناسهٔ فراگیر: ترمی → شمارهٔ دانشجویی، پودمانی → کد مهارت‌آموزی. */
export const LEARNER_IDENTIFIER_TITLE: Record<ReportPeriodMode, string> = {
  term: 'شماره دانشجویی',
  module: 'کد مهارت‌آموزی',
};

/** تعریف ستون‌های جدول گزارش‌ها (فقط ساختار؛ داده همیشه از API می‌آید). */
const COLUMN_DEFS: Record<ReportSlug, ReportColumnDef[]> = {
  // ترتیب: فراگیر - استان - دانشکده (رشته تحصیلی کم‌رنگ‌تر زیرش) - مدرسه - استاد - معلم - درس.
  learners: [
    {
      id: 'name',
      title: 'نام فراگیر',
      kind: 'two-line',
      sortKey: 'name',
      secondaryKey: 'phone',
    },
    { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
    {
      id: 'faculty',
      title: 'دانشکده',
      kind: 'two-line',
      sortKey: 'facName',
      secondaryKey: 'major',
    },
    {
      id: 'school',
      title: 'مدرسه',
      kind: 'two-line',
      sortKey: 'schoolName',
      secondaryKey: 'regionName',
    },
    { id: 'prof', title: 'استاد راهنما', kind: 'text', sortKey: 'profName' },
    { id: 'teacher', title: 'معلم راهنما', kind: 'text', sortKey: 'teacherName' },
    { id: 'course', title: 'درس', kind: 'courses', sortKey: 'course' },
  ],
  attendance: [
    {
      id: 'name',
      title: 'نام',
      kind: 'two-line',
      sortKey: 'name',
      secondaryKey: 'phone',
    },
    { id: 'major', title: 'رشته تحصیلی', kind: 'text', sortKey: 'major' },
    { id: 'course', title: 'درس', kind: 'courses', sortKey: 'course' },
    { id: 'faculty', title: 'دانشکده', kind: 'text', sortKey: 'facName' },
    { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
    {
      id: 'school',
      title: 'مدرسه',
      kind: 'two-line',
      sortKey: 'schoolName',
      secondaryKey: 'regionName',
    },
    { id: 'prof', title: 'استاد راهنما', kind: 'text', sortKey: 'profName' },
    { id: 'teacher', title: 'معلم راهنما', kind: 'text', sortKey: 'teacherName' },
    { id: 'att', title: 'درصد حضور', kind: 'percent', sortKey: 'att' },
  ],
  'professor-attendance': [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'code', title: 'کد استادی', kind: 'text', sortKey: 'code' },
    { id: 'fac', title: 'دانشکده', kind: 'text', sortKey: 'facName' },
    { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
    { id: 'city', title: 'شهر', kind: 'text', sortKey: 'cityName' },
    { id: 'att', title: 'درصد حضور', kind: 'percent', sortKey: 'att' },
    {
      id: 'attProf',
      title: 'نرخ حضور استاد تایید شده توسط استاد',
      kind: 'percent',
      sortKey: 'attProf',
    },
    {
      id: 'attMgr',
      title: 'نرخ حضور استاد تایید شده توسط مدیران',
      kind: 'percent',
      sortKey: 'attMgr',
    },
  ],
  // نمرات: نام (تلفن زیرش) - استان - دانشکده (رشته زیرش) - مدرسه - استاد - معلم - نمرات.
  // درس و وضعیت قبول/مردود هر درس داخل مودال «مشاهده ریز نمرات» است.
  scores: [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
    { id: 'faculty', title: 'دانشکده', kind: 'text', sortKey: 'facName' },
    {
      id: 'school',
      title: 'مدرسه',
      kind: 'two-line',
      sortKey: 'schoolName',
      secondaryKey: 'regionName',
    },
    { id: 'prof', title: 'استاد راهنما', kind: 'text', sortKey: 'profName' },
    { id: 'teacher', title: 'معلم راهنما', kind: 'text', sortKey: 'teacherName' },
    {
      id: 'act',
      title: 'نمرات',
      kind: 'scores-action',
      nosort: true,
    },
  ],
  teachers: [
    {
      id: 'name',
      title: 'نام',
      kind: 'two-line',
      sortKey: 'name',
      secondaryKey: 'phone',
    },
    { id: 'code', title: 'کد پرسنلی', kind: 'text', sortKey: 'code' },
    { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
    { id: 'region', title: 'منطقه', kind: 'text', sortKey: 'regionName' },
    { id: 'school', title: 'مدرسه', kind: 'text', sortKey: 'schoolName' },
    { id: 'n', title: 'تعداد فراگیر', kind: 'count', sortKey: 'n' },
  ],
  principals: [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'code', title: 'کد پرسنلی', kind: 'text', sortKey: 'code' },
    { id: 'phone', title: 'شماره تلفن', kind: 'phone', sortKey: 'phone' },
    {
      id: 'school',
      title: 'مدرسه',
      kind: 'two-line',
      sortKey: 'schoolName',
      secondaryKey: 'regionName',
    },
  ],
  professors: [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'code', title: 'کد استادی', kind: 'text', sortKey: 'code' },
    { id: 'phone', title: 'شماره تلفن', kind: 'phone', sortKey: 'phone' },
    { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
    { id: 'fac', title: 'دانشکده', kind: 'text', sortKey: 'facName' },
  ],
  schools: [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'gender', title: 'جنسیت', kind: 'text', sortKey: 'genderLabel' },
    {
      id: 'principal',
      title: 'نام مدیر (کد پرسنلی)',
      kind: 'two-line',
      sortKey: 'principalName',
      secondaryKey: 'principalCode',
    },
    { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
    { id: 'city', title: 'شهر', kind: 'text', sortKey: 'cityName' },
    { id: 'region', title: 'منطقه', kind: 'text', sortKey: 'regionName' },
    { id: 'nT', title: 'تعداد معلمان', kind: 'count', sortKey: 'nT' },
    { id: 'n', title: 'تعداد فراگیر', kind: 'count', sortKey: 'n' },
  ],
  'teacher-performance': [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'code', title: 'کد پرسنلی', kind: 'text', sortKey: 'code' },
    { id: 'phone', title: 'شماره تلفن', kind: 'phone', sortKey: 'phone' },
    {
      id: 'school',
      title: 'مدرسه',
      kind: 'two-line',
      sortKey: 'schoolName',
      secondaryKey: 'regionName',
    },
    { id: 'n', title: 'تعداد فراگیران', kind: 'count', sortKey: 'n' },
    {
      id: 'resp',
      title: 'نرخ پاسخ‌دهی به گزارش‌ها',
      kind: 'percent',
      sortKey: 'resp',
    },
  ],
  'school-performance': [
    {
      id: 'name',
      title: 'نام مدرسه',
      kind: 'two-line',
      sortKey: 'name',
      secondaryKey: 'regionName',
    },
    {
      id: 'principal',
      title: 'نام مدیر مدرسه (کد پرسنلی)',
      kind: 'two-line',
      sortKey: 'principalName',
      secondaryKey: 'principalCode',
    },
    {
      id: 'resp',
      title: 'نرخ پاسخ‌دهی به گزارش‌ها',
      kind: 'percent',
      sortKey: 'resp',
    },
    {
      id: 'score',
      title: 'میانگین نمره فراگیران',
      kind: 'percent',
      sortKey: 'score',
    },
  ],
  'professor-performance': [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'code', title: 'کد استادی', kind: 'text', sortKey: 'code' },
    { id: 'phone', title: 'شماره تلفن', kind: 'phone', sortKey: 'phone' },
    {
      id: 'days',
      title: 'میانگین روزهای حضور نسبت به کل جلسات',
      kind: 'percent',
      sortKey: 'days',
    },
    {
      id: 'resp',
      title: 'نرخ پاسخ‌دهی به گزارش‌ها',
      kind: 'percent',
      sortKey: 'resp',
    },
    {
      id: 'score',
      title: 'میانگین نمره فراگیران',
      kind: 'percent',
      sortKey: 'score',
    },
  ],
  faculties: [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'prov', title: 'استان', kind: 'text', sortKey: 'provName' },
    { id: 'city', title: 'شهر', kind: 'text', sortKey: 'cityName' },
    { id: 'head', title: 'رئیس دانشکده', kind: 'text', sortKey: 'head' },
    { id: 'nP', title: 'تعداد اساتید', kind: 'count', sortKey: 'nP' },
    { id: 'n', title: 'تعداد فراگیران', kind: 'count', sortKey: 'n' },
  ],
  provinces: [
    { id: 'name', title: 'نام استان', kind: 'text', sortKey: 'name' },
    { id: 'head', title: 'رئیس دانشگاه استانی', kind: 'text', sortKey: 'head' },
    { id: 'nF', title: 'تعداد دانشکده‌ها', kind: 'count', sortKey: 'nF' },
    { id: 'nP', title: 'تعداد اساتید', kind: 'count', sortKey: 'nP' },
    { id: 'n', title: 'تعداد فراگیران', kind: 'count', sortKey: 'n' },
  ],
  'faculty-performance': [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'prov', title: 'استان', kind: 'text', sortKey: 'provName' },
    { id: 'city', title: 'شهر', kind: 'text', sortKey: 'cityName' },
    {
      id: 'days',
      title: 'میانگین روزهای حضور نسبت به کل جلسات',
      kind: 'percent',
      sortKey: 'days',
    },
    {
      id: 'resp',
      title: 'نرخ پاسخ‌دهی به گزارش‌ها',
      kind: 'percent',
      sortKey: 'resp',
    },
    {
      id: 'score',
      title: 'میانگین نمره فراگیران',
      kind: 'percent',
      sortKey: 'score',
    },
  ],
  'province-performance': [
    { id: 'name', title: 'نام استان', kind: 'text', sortKey: 'name' },
    {
      id: 'days',
      title: 'میانگین روزهای حضور نسبت به کل جلسات',
      kind: 'percent',
      sortKey: 'days',
    },
    {
      id: 'resp',
      title: 'نرخ پاسخ‌دهی به گزارش‌ها',
      kind: 'percent',
      sortKey: 'resp',
    },
    {
      id: 'score',
      title: 'میانگین نمره فراگیران',
      kind: 'percent',
      sortKey: 'score',
    },
  ],
};

/** ستون‌های هر گزارش (فقط ساختار؛ داده از API می‌آید). */
export function getColumnDefs(
  slug: ReportSlug,
  // نگه داشته شده برای سازگاری امضا؛ ستون‌های لیست به نظام دوره بستگی ندارند.
  _mode: ReportPeriodMode = 'term'
): ReportColumnDef[] {
  return COLUMN_DEFS[slug];
}
