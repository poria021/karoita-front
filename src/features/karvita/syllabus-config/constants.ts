import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import type {
  AcademicTermType,
  SyllabusConfigSubTab,
} from '@/types/syllabus-config';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

export type SyllabusTabConfig = {
  key: SyllabusConfigSubTab;
  label: string;
  shortLabel: string;
  icon: IconDefinition;
};

export const SYLLABUS_CONFIG_TABS: SyllabusTabConfig[] = [
  {
    key: 'course_offerings',
    label: 'ارائه و سرفصل دروس',
    shortLabel: 'ارائه دروس',
    icon: faIcons.sliders,
  },
  {
    key: 'term_settings',
    label: 'تنظیمات عمومی ترم‌ها',
    shortLabel: 'تنظیمات ترم',
    icon: faIcons.clockRotateLeft,
  },
];

export const SEMESTER_PREFIX_OPTIONS = [
  'نیم‌سال اول',
  'نیم‌سال دوم',
  'تابستان',
] as const;

export const MODULAR_PREFIX_OPTIONS = [
  'پودمان اول',
  'پودمان دوم',
  'پودمان پاییزه',
  'پودمان بهاره',
] as const;

export const TERM_TYPE_OPTIONS: {
  value: AcademicTermType;
  label: string;
}[] = [
  {
    value: 'semester',
    label: 'دانشجویی (نیم‌سالی - ۴ مرحله کارورزی)',
  },
  {
    value: 'modular',
    label: 'مهارت‌آموزی (پودمانی - ۲ مرحله کارآموزی)',
  },
];

export const WEEK_WEIGHT_OPTIONS = [
  { value: 1, label: '۱ - خیلی کم' },
  { value: 2, label: '۲ - کم' },
  { value: 3, label: '۳ - متوسط' },
  { value: 4, label: '۴ - زیاد' },
  { value: 5, label: '۵ - خیلی زیاد' },
] as const;

export const DEFAULT_WEEK_WEIGHT = 3;

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
