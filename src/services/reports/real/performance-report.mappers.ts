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
import type { ReportColumnDef, ReportRow } from '@/types/reports';

export type PerformanceReportSlug =
  | 'teacher-performance'
  | 'school-performance'
  | 'professor-performance'
  | 'faculty-performance'
  | 'province-performance';

const PERFORMANCE_SLUGS: readonly PerformanceReportSlug[] = [
  'teacher-performance',
  'school-performance',
  'professor-performance',
  'faculty-performance',
  'province-performance',
];

export function isPerformanceReportSlug(
  slug: ReportSlug | string
): slug is PerformanceReportSlug {
  return (PERFORMANCE_SLUGS as readonly string[]).includes(slug);
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
  return {
    ...baseRow(rec, index),
    name: pickText(rec.title),
    genderLabel: gender ? (GENDER_LABEL[gender] ?? gender) : undefined,
    head: pickText(rec.adminName),
    code: pickText(rec.adminPersonnelCode),
    resp: pickNumber(rec.responseRate),
    score: pickNumber(rec.averageScore),
  };
}

function mapProfessorPerformance(
  rec: Record<string, unknown>,
  index: number
): ReportRow {
  return {
    ...baseRow(rec, index),
    name: pickText(rec.fullName),
    code: pickText(rec.personnelCode),
    phone: pickText(rec.phone),
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
    head: pickText(rec.head),
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
  // هر ردیف یک معلم راهنما
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
    { id: 'n', title: 'تعداد فراگیر', kind: 'count', sortKey: 'n' },
    {
      id: 'resp',
      title: 'درصد جلسه‌های پاسخ‌داده‌شده',
      kind: 'percent',
      sortKey: 'resp',
    },
  ],
  // هر ردیف یک مدرسه
  'school-performance': [
    { id: 'name', title: 'عنوان مدرسه', kind: 'text', sortKey: 'name' },
    { id: 'gender', title: 'جنسیت', kind: 'text', sortKey: 'genderLabel' },
    { id: 'head', title: 'نام مدیر', kind: 'text', sortKey: 'head' },
    { id: 'code', title: 'کد پرسنلی مدیر', kind: 'text', sortKey: 'code' },
    { id: 'resp', title: 'نرخ پاسخ', kind: 'percent', sortKey: 'resp' },
    { id: 'score', title: 'میانگین نمره', kind: 'score', sortKey: 'score' },
  ],
  // هر ردیف یک استاد
  'professor-performance': [
    { id: 'name', title: 'نام', kind: 'text', sortKey: 'name' },
    { id: 'code', title: 'کد پرسنلی', kind: 'text', sortKey: 'code' },
    { id: 'phone', title: 'شماره تلفن', kind: 'phone', sortKey: 'phone' },
    { id: 'att', title: 'درصد حضور', kind: 'percent', sortKey: 'att' },
    { id: 'resp', title: 'نرخ پاسخ', kind: 'percent', sortKey: 'resp' },
    { id: 'score', title: 'میانگین نمره', kind: 'score', sortKey: 'score' },
  ],
  // هر ردیف یک دانشکده
  'faculty-performance': [
    { id: 'name', title: 'عنوان دانشکده', kind: 'text', sortKey: 'name' },
    { id: 'province', title: 'استان', kind: 'text', sortKey: 'provName' },
    { id: 'city', title: 'شهر', kind: 'text', sortKey: 'cityName' },
    { id: 'att', title: 'درصد حضور', kind: 'percent', sortKey: 'att' },
    { id: 'resp', title: 'نرخ پاسخ', kind: 'percent', sortKey: 'resp' },
    { id: 'score', title: 'میانگین نمره', kind: 'score', sortKey: 'score' },
  ],
  // هر ردیف یک استان
  'province-performance': [
    { id: 'name', title: 'عنوان استان', kind: 'text', sortKey: 'name' },
    { id: 'head', title: 'مسئول', kind: 'text', sortKey: 'head' },
    { id: 'att', title: 'درصد حضور', kind: 'percent', sortKey: 'att' },
    { id: 'resp', title: 'نرخ پاسخ', kind: 'percent', sortKey: 'resp' },
    { id: 'score', title: 'میانگین نمره', kind: 'score', sortKey: 'score' },
  ],
};
