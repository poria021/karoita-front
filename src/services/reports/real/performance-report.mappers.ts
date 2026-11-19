/**
 * نگاشت ردیف جدول پنج «گزارش عملکرد» (Nest، تگ Reports):
 * معلمان، مدارس، اساتید، دانشکده‌ها، استان‌ها.
 *
 * - `GET v1/reports/teachers/performance`
 * - `GET v1/reports/schools/performance`
 * - `GET v1/reports/professors/performance`
 * - `GET v1/reports/faculties/performance`
 * - `GET v1/reports/provinces/performance`
 *
 * سه عدد حضور (`att`)، پاسخ (`resp`) و میانگین (`score`) جدا هستند.
 * `averageScore` ممکن است `null` باشد؛ آن‌وقت فیلد خالی می‌ماند و سلول «—» می‌شود.
 */
import type { ReportSlug } from '@/types/report-access';
import type { ReportColumnDef, ReportRow, ReportSort } from '@/types/reports';

export type PerformanceReportSlug =
  | 'teacher-performance'
  | 'school-performance'
  | 'professor-performance'
  | 'faculty-performance'
  | 'province-performance';

/** کلیدهای `sortBy` که Nest برای گزارش‌های عملکرد می‌پذیرد. */
export type PerformanceSortBy =
  | 'responseRate'
  | 'averageScore'
  | 'attendancePercent';

const PERFORMANCE_SLUGS: readonly PerformanceReportSlug[] = [
  'teacher-performance',
  'school-performance',
  'professor-performance',
  'faculty-performance',
  'province-performance',
];

/**
 * ستون UI (`id`) → `sortBy` Nest.
 * فقط همین کلیدها برای همان گزارش مجازند؛ بقیه nosort هستند.
 */
const PERFORMANCE_COLUMN_SORT_BY: Record<
  PerformanceReportSlug,
  Partial<Record<string, PerformanceSortBy>>
> = {
  'teacher-performance': { resp: 'responseRate' },
  'school-performance': {
    resp: 'responseRate',
    score: 'averageScore',
  },
  'professor-performance': {
    att: 'attendancePercent',
    resp: 'responseRate',
    score: 'averageScore',
  },
  'faculty-performance': {
    att: 'attendancePercent',
    resp: 'responseRate',
    score: 'averageScore',
  },
  'province-performance': {
    att: 'attendancePercent',
    resp: 'responseRate',
    score: 'averageScore',
  },
};

export function isPerformanceReportSlug(
  slug: ReportSlug | string
): slug is PerformanceReportSlug {
  return (PERFORMANCE_SLUGS as readonly string[]).includes(slug);
}

/**
 * پارامترهای مرتب‌سازی Nest برای جدول/خروجی عملکرد.
 * بدون sort یا ستون غیرمجاز → هیچ‌کدام فرستاده نمی‌شود.
 */
export function performanceSortParams(
  slug: ReportSlug | string,
  sort: ReportSort | null | undefined
): { sortBy?: PerformanceSortBy; sortOrder?: 'asc' | 'desc' } {
  if (!sort || !isPerformanceReportSlug(slug)) return {};
  const sortBy = PERFORMANCE_COLUMN_SORT_BY[slug][sort.id];
  if (!sortBy) return {};
  return { sortBy, sortOrder: sort.dir };
}

function pickText(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
    if (value && typeof value === 'object') {
      const rec = value as Record<string, unknown>;
      const nested = pickText(rec.title, rec.fullName, rec.name);
      if (nested) return nested;
    }
  }
  return undefined;
}

/** عدد معتبر یا `undefined` (`null`/رشتهٔ خالی/ناعدد → خالی). */
function pickNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

const GENDER_LABEL: Record<string, string> = {
  Boy: 'پسرانه',
  Girl: 'دخترانه',
};

function baseRow(rec: Record<string, unknown>, index: number): ReportRow {
  return { id: pickText(rec.id, rec._id) ?? `row-${index}`, s: '' };
}

function mapTeacherPerformance(
  rec: Record<string, unknown>,
  index: number
): ReportRow {
  // مدرسه ممکن است آبجکت، رشته یا (در بعضی پاسخ‌ها) آرایهٔ `schools` باشد.
  const firstSchool = Array.isArray(rec.schools) ? rec.schools[0] : undefined;
  const schoolSource = rec.school ?? firstSchool;
  const school =
    schoolSource && typeof schoolSource === 'object'
      ? (schoolSource as Record<string, unknown>)
      : {};
  return {
    ...baseRow(rec, index),
    name: pickText(rec.fullName),
    code: pickText(rec.personnelCode),
    phone: pickText(rec.phone),
    schoolName: pickText(
      school.title,
      school.name,
      typeof schoolSource === 'string' ? schoolSource : undefined,
      rec.schoolTitle,
      rec.schoolName
    ),
    regionName: pickText(
      school.district,
      rec.district,
      rec.educationalDistrict
    ),
    n: pickNumber(rec.learnerCount),
    resp: pickNumber(rec.responseRate),
  };
}

function mapSchoolPerformance(
  rec: Record<string, unknown>,
  index: number
): ReportRow {
  const gender = pickText(rec.gender);
  const name = pickText(rec.title);
  const genderLabel = gender ? (GENDER_LABEL[gender] ?? gender) : undefined;
  const head = pickText(rec.adminName);
  return {
    ...baseRow(rec, index),
    name,
    genderLabel,
    head,
    // «نام مدرسه (جنسیت)، نام مدیر» در یک سلول.
    schoolLabel: name
      ? name + (genderLabel ? ' (' + genderLabel + ')' : '') + (head ? '، ' + head : '')
      : undefined,
    code: pickText(rec.adminPersonnelCode),
    provName: pickText(rec.province, rec.provinceTitle, rec.provinceName),
    cityName: pickText(rec.city, rec.cityTitle, rec.cityName),
    regionName: pickText(
      rec.educationalDistrict,
      rec.educationalDistrictTitle,
      rec.district,
      rec.region
    ),
    resp: pickNumber(rec.responseRate),
    score: pickNumber(rec.averageScore),
    // میز کار دانشکده: جمع فراگیران مدارس از همین گزارش.
    n: pickNumber(rec.learnerCount),
  };
}

function mapProfessorPerformance(
  rec: Record<string, unknown>,
  index: number
): ReportRow {
  const name = pickText(rec.fullName);
  const phone = pickText(rec.phone);
  return {
    ...baseRow(rec, index),
    name,
    // «نام (شماره)» در یک سلول؛ بدون نام فقط شماره می‌ماند.
    nameLabel: name
      ? name + (phone ? ' (' + phone + ')' : '')
      : phone
        ? '— (' + phone + ')'
        : undefined,
    code: pickText(rec.personnelCode),
    phone,
    provName: pickText(rec.province, rec.provinceTitle, rec.provinceName),
    facName: pickText(
      rec.university,
      rec.universityTitle,
      rec.universityName,
      rec.faculty
    ),
    att: pickNumber(rec.attendancePercent),
    resp: pickNumber(rec.responseRate),
    score: pickNumber(rec.averageScore),
  };
}

function mapFacultyPerformance(
  rec: Record<string, unknown>,
  index: number
): ReportRow {
  return {
    ...baseRow(rec, index),
    name: pickText(rec.title),
    provName: pickText(rec.province),
    cityName: pickText(rec.city, rec.cityTitle, rec.cityName),
    att: pickNumber(rec.attendancePercent),
    resp: pickNumber(rec.responseRate),
    score: pickNumber(rec.averageScore),
  };
}

function mapProvincePerformance(
  rec: Record<string, unknown>,
  index: number
): ReportRow {
  return {
    ...baseRow(rec, index),
    name: pickText(rec.title),
    head: pickText(
      rec.head,
      rec.adminName,
      rec.managerName,
      rec.manager,
      rec.headName,
      rec.responsible,
      rec.admin
    ),
    att: pickNumber(rec.attendancePercent),
    resp: pickNumber(rec.responseRate),
    score: pickNumber(rec.averageScore),
  };
}

const ROW_MAPPERS: Record<
  PerformanceReportSlug,
  (rec: Record<string, unknown>, index: number) => ReportRow
> = {
  'teacher-performance': mapTeacherPerformance,
  'school-performance': mapSchoolPerformance,
  'professor-performance': mapProfessorPerformance,
  'faculty-performance': mapFacultyPerformance,
  'province-performance': mapProvincePerformance,
};

export function mapPerformanceRow(
  slug: PerformanceReportSlug,
  raw: unknown,
  index: number
): ReportRow | null {
  if (!raw || typeof raw !== 'object') return null;
  return ROW_MAPPERS[slug](raw as Record<string, unknown>, index);
}

/** ستون‌های هر گزارش عملکرد در حالت real — فقط فیلدهایی که API می‌دهد. */
export const PERFORMANCE_COLUMNS: Record<
  PerformanceReportSlug,
  ReportColumnDef[]
> = {
  // هر ردیف یک معلم راهنما — سورت API فقط responseRate
  'teacher-performance': [
    {
      id: 'name',
      title: 'نام',
      kind: 'text',
      sortKey: 'name',
      nosort: true,
    },
    {
      id: 'code',
      title: 'کد پرسنلی',
      kind: 'text',
      sortKey: 'code',
      nosort: true,
    },
    {
      id: 'phone',
      title: 'شماره تلفن',
      kind: 'phone',
      sortKey: 'phone',
      nosort: true,
    },
    {
      id: 'school',
      title: 'مدرسه',
      kind: 'two-line',
      sortKey: 'schoolName',
      secondaryKey: 'regionName',
      nosort: true,
    },
    { id: 'n', title: 'تعداد فراگیر', kind: 'count', sortKey: 'n', nosort: true },
    {
      id: 'resp',
      title: 'درصد جلسه‌های پاسخ‌داده‌شده',
      kind: 'percent',
      sortKey: 'resp',
    },
  ],
  // هر ردیف یک مدرسه — سورت فقط روی نرخ پاسخ و میانگین نمره
  'school-performance': [
    {
      id: 'name',
      title: 'نام مدرسه',
      kind: 'text',
      sortKey: 'name',
      nosort: true,
    },
    {
      id: 'gender',
      title: 'جنسیت',
      kind: 'text',
      sortKey: 'genderLabel',
      nosort: true,
    },
    {
      id: 'head',
      title: 'نام مدیر',
      kind: 'text',
      sortKey: 'head',
      nosort: true,
    },
    {
      id: 'code',
      title: 'کد پرسنلی مدیر',
      kind: 'text',
      sortKey: 'code',
      nosort: true,
    },
    { id: 'resp', title: 'نرخ پاسخ', kind: 'percent', sortKey: 'resp' },
    { id: 'score', title: 'میانگین نمره', kind: 'score', sortKey: 'score' },
  ],
  // هر ردیف یک استاد — سورت روی درصد حضور، نرخ پاسخ و میانگین نمره
  'professor-performance': [
    {
      id: 'name',
      title: 'نام',
      kind: 'text',
      sortKey: 'name',
      nosort: true,
    },
    {
      id: 'code',
      title: 'کد پرسنلی',
      kind: 'text',
      sortKey: 'code',
      nosort: true,
    },
    {
      id: 'phone',
      title: 'شماره موبایل',
      kind: 'phone',
      sortKey: 'phone',
      nosort: true,
    },
    { id: 'att', title: 'درصد حضور', kind: 'percent', sortKey: 'att' },
    { id: 'resp', title: 'نرخ پاسخ', kind: 'percent', sortKey: 'resp' },
    {
      id: 'score',
      title: 'میانگین نمره فراگیران',
      kind: 'score',
      sortKey: 'score',
    },
  ],
  // هر ردیف یک دانشکده — سورت روی سه ستون آخر
  'faculty-performance': [
    {
      id: 'name',
      title: 'نام دانشکده',
      kind: 'text',
      sortKey: 'name',
      nosort: true,
    },
    {
      id: 'province',
      title: 'استان',
      kind: 'text',
      sortKey: 'provName',
      nosort: true,
    },
    { id: 'city', title: 'شهر', kind: 'text', sortKey: 'cityName', nosort: true },
    { id: 'att', title: 'درصد حضور اساتید', kind: 'percent', sortKey: 'att' },
    { id: 'resp', title: 'نرخ پاسخ', kind: 'percent', sortKey: 'resp' },
    { id: 'score', title: 'میانگین نمره', kind: 'score', sortKey: 'score' },
  ],
  // هر ردیف یک استان — سورت روی سه ستون آخر
  'province-performance': [
    {
      id: 'name',
      title: 'نام استان',
      kind: 'text',
      sortKey: 'name',
      nosort: true,
    },
    { id: 'att', title: 'درصد حضور اساتید', kind: 'percent', sortKey: 'att' },
    { id: 'resp', title: 'نرخ پاسخ‌دهی', kind: 'percent', sortKey: 'resp' },
    {
      id: 'score',
      title: 'میانگین نمره فراگیران',
      kind: 'score',
      sortKey: 'score',
    },
  ],
};
