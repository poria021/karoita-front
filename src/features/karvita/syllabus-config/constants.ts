/**
 * Syllabus-config feature constants.
 * Live routes under `/karvita/admin/syllabus/*` via RouteService
 * (`syllabusConfig`, `syllabusCourseOfferings`, `syllabusTermSettings`).
 */
import type { AcademicTermType } from '@/types/syllabus-config';
import { toPersianDigits } from '@/utils/persianDigits';

export const SEMESTER_PREFIX_OPTIONS = [
  'نیم‌سال اول',
  'نیم‌سال دوم',
  'تابستان',
] as const;

export const MODULAR_PREFIX_OPTIONS = [
  'کارآموزی 1',
  'کارآموزی 2',
] as const;

export const TERM_TYPE_OPTIONS: {
  value: AcademicTermType;
  label: string;
}[] = [
  {
    value: 'semester',
    label: 'ترمی (دانشجو / کارورزی)',
  },
  {
    value: 'modular',
    label: 'پودمانی (مهارت‌آموز / کارآموزی)',
  },
];

/** تب فیلتر ارائه سرفصل: ترمی=دانشجو، پودمانی=مهارت‌آموز. */
export const COURSE_OFFERING_AUDIENCE_TABS: {
  value: AcademicTermType;
  label: string;
}[] = [
  { value: 'semester', label: 'ترمی' },
  { value: 'modular', label: 'پودمانی' },
];

export const WEEK_WEIGHT_OPTIONS = [
  { value: 1, label: '۱ - خیلی کم' },
  { value: 2, label: '۲ - کم' },
  { value: 3, label: '۳ - متوسط' },
  { value: 4, label: '۴ - زیاد' },
  { value: 5, label: '۵ - خیلی زیاد' },
] as const;

export function defaultPrefixForType(type: AcademicTermType): string {
  return type === 'modular' ? MODULAR_PREFIX_OPTIONS[0] : SEMESTER_PREFIX_OPTIONS[0];
}

export function displayAcademicYear(year: string): string {
  return toPersianDigits(year);
}

export function parseTermTitleParts(title: string): {
  prefix: string;
  academicYear: string;
} {
  const parts = title.trim().split(/\s+/);
  if (parts.length < 2) {
    return { prefix: title, academicYear: '' };
  }
  return {
    prefix: parts.slice(0, -1).join(' '),
    academicYear: parts[parts.length - 1] ?? '',
  };
}

/** Option label for course-offerings / term pickers: «عنوان بازه · سال تحصیلی». */
export function formatTermOptionLabel(title: string): string {
  const { prefix, academicYear } = parseTermTitleParts(title);
  if (!academicYear) return toPersianDigits(title);
  return `${toPersianDigits(prefix)} · ${toPersianDigits(academicYear)}`;
}
