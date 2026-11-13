import {
  COMPARE_REPORT_SLUGS,
  REPORT_ACCESS_THEMES,
  REPORT_PAGE_META,
} from '@/features/karvita/report-access/constants';
import type { ReportSlug } from '@/types/report-access';

export {
  COMPARE_REPORT_SLUGS,
  REPORT_ACCESS_THEMES,
  REPORT_PAGE_META,
};

/**
 * کل ماژول گزارش‌گیری (منو، ریل، صفحات، دسترسی گزارش) موقتاً روی این شاخه خاموش است.
 * برای برگرداندن: `true` کنید.
 */
export const REPORTS_MODULE_ENABLED = false;

/** مقایسه گزارش‌ها موقتاً برای انتشار خاموش است — دکمه و جریان مقایسه رندر نمی‌شوند. */
export const REPORT_COMPARE_ENABLED = false;

/**
 * گزارش نمرات فراگیران موقتاً برای همهٔ پنل‌ها خاموش است.
 * از منو/ریل حذف می‌شود و URL مستقیم به گزارش پیش‌فرض برمی‌گردد.
 */
export const REPORT_SCORES_ENABLED = false;

export const REPORT_THEMES = REPORT_ACCESS_THEMES;

export const ALL_REPORT_SLUGS = [
  'learners',
  'attendance',
  'professor-attendance',
  'scores',
  'teachers',
  'principals',
  'professors',
  'schools',
  'teacher-performance',
  'school-performance',
  'professor-performance',
  'faculties',
  'provinces',
  'faculty-performance',
  'province-performance',
] as const satisfies readonly ReportSlug[];

const SLUG_SET = new Set<string>(ALL_REPORT_SLUGS);

export function isReportSlug(s: string): s is ReportSlug {
  return SLUG_SET.has(s);
}

export function isEnabledReportSlug(slug: ReportSlug): boolean {
  if (!REPORTS_MODULE_ENABLED) return false;
  if (slug === 'scores') return REPORT_SCORES_ENABLED;
  return true;
}

export function filterEnabledReportSlugs(
  slugs: readonly ReportSlug[]
): ReportSlug[] {
  return slugs.filter(isEnabledReportSlug);
}

/** تم‌های گزارش برای منو/ریل — اسلاگ‌های خاموش حذف شده‌اند. */
export function enabledReportThemes(): typeof REPORT_THEMES {
  return REPORT_THEMES.map((theme) => ({
    ...theme,
    slugs: filterEnabledReportSlugs(theme.slugs),
  })).filter((theme) => theme.slugs.length > 0);
}

export const ENABLED_REPORT_SLUGS: readonly ReportSlug[] =
  filterEnabledReportSlugs(ALL_REPORT_SLUGS);

export type ReportPageDef = {
  title: string;
  icon: string;
  entity: string;
  placeholder: string;
  first: string[];
  more: string[];
  fac?: boolean;
  period?: boolean;
  learner?: boolean;
  /** تب ترمی/پودمانی؛ پیش‌فرض روشن. لیست‌های موجودیتی خاموش‌اند. */
  periodModes?: boolean;
  desc: { term: string; module: string };
};

const PAGE_ICONS: Record<ReportSlug, string> = {
  learners: 'fa-graduation-cap',
  attendance: 'fa-clipboard-check',
  'professor-attendance': 'fa-user-tie',
  scores: 'fa-chart-column',
  teachers: 'fa-chalkboard-user',
  principals: 'fa-id-card',
  professors: 'fa-user-tie',
  schools: 'fa-school',
  'teacher-performance': 'fa-gauge-high',
  'school-performance': 'fa-chart-line',
  'professor-performance': 'fa-chart-line',
  faculties: 'fa-building-columns',
  provinces: 'fa-map-location-dot',
  'faculty-performance': 'fa-chart-line',
  'province-performance': 'fa-chart-column',
};

export const REPORT_PAGE_DEFS: Record<ReportSlug, ReportPageDef> = {
  learners: {
    title: REPORT_PAGE_META.learners.title,
    icon: PAGE_ICONS.learners,
    entity: 'learner',
    placeholder: 'نام، تلفن یا رشته تحصیلی',
    first: ['q', 'period', 'province', 'city', 'region', 'faculty'],
    more: ['school', 'professor', 'teacher'],
    learner: true,
    desc: {
      term:
        'فراگیرانی که در نیم‌سال انتخاب‌شده درس دارند. اگر فراگیری درس بیشتری دارد، کنار اولین درس شمارنده‌ای مثل «+۲» می‌آید؛ با زدن روی آن همه‌ی درس‌ها باز می‌شود.',
      module:
        'فراگیرانی که در پودمان انتخاب‌شده ثبت‌نام کرده‌اند. اگر فراگیری درس بیشتری دارد، کنار اولین درس شمارنده‌ای مثل «+۲» می‌آید؛ با زدن روی آن همه‌ی درس‌ها باز می‌شود.',
    },
  },
  attendance: {
    title: REPORT_PAGE_META.attendance.title,
    icon: PAGE_ICONS.attendance,
    entity: 'learner',
    placeholder: 'نام، تلفن یا رشته تحصیلی',
    first: ['q', 'period', 'province', 'city', 'faculty'],
    more: ['region', 'school', 'professor', 'teacher'],
    learner: true,
    desc: {
      term: 'درصد حضور یعنی جلسات حضور تأییدشده نسبت به کل جلسات نیم‌سال انتخاب‌شده.',
      module:
        'درصد حضور یعنی جلسات حضور تأییدشده نسبت به کل جلسات پودمان انتخاب‌شده.',
    },
  },
  'professor-attendance': {
    title: REPORT_PAGE_META['professor-attendance'].title,
    icon: PAGE_ICONS['professor-attendance'],
    entity: 'profAtt',
    placeholder: 'نام یا کد استادی',
    fac: true,
    period: true,
    periodModes: false,
    first: ['q', 'province', 'city', 'faculty'],
    more: [],
    desc: {
      term: 'درصد حضور اساتید راهنما در جلسات نیم‌سال انتخاب‌شده.',
      module: 'درصد حضور اساتید راهنما در جلسات پودمان انتخاب‌شده.',
    },
  },
  scores: {
    title: REPORT_PAGE_META.scores.title,
    icon: PAGE_ICONS.scores,
    entity: 'score',
    placeholder: 'نام یا شماره تلفن',
    first: ['q', 'period'],
    more: ['region', 'faculty', 'school', 'professor', 'teacher'],
    learner: true,
    desc: {
      term:
        'هر ردیف یک فراگیر در نیم‌سال انتخاب‌شده است. برای دیدن نمره‌ی هر درس در هر جلسه، «مشاهده ریز نمرات» را بزنید.',
      module:
        'هر ردیف یک فراگیر در پودمان انتخاب‌شده است. برای دیدن نمره‌ی هر درس در هر جلسه، «مشاهده ریز نمرات» را بزنید.',
    },
  },
  teachers: {
    title: REPORT_PAGE_META.teachers.title,
    icon: PAGE_ICONS.teachers,
    entity: 'teacher',
    placeholder: 'نام، کد پرسنلی یا تلفن',
    period: true,
    periodModes: false,
    first: ['q', 'province', 'city', 'region'],
    more: ['school'],
    desc: { term: REPORT_PAGE_META.teachers.description, module: REPORT_PAGE_META.teachers.description },
  },
  principals: {
    title: REPORT_PAGE_META.principals.title,
    icon: PAGE_ICONS.principals,
    entity: 'principal',
    placeholder: 'نام، کد پرسنلی یا تلفن',
    period: true,
    periodModes: false,
    first: ['q', 'province', 'city', 'region'],
    more: ['teacher'],
    desc: { term: REPORT_PAGE_META.principals.description, module: REPORT_PAGE_META.principals.description },
  },
  professors: {
    title: REPORT_PAGE_META.professors.title,
    icon: PAGE_ICONS.professors,
    entity: 'professor',
    placeholder: 'نام، کد استادی یا تلفن',
    fac: true,
    period: true,
    periodModes: false,
    first: ['q', 'province', 'city', 'faculty'],
    more: [],
    desc: { term: REPORT_PAGE_META.professors.description, module: REPORT_PAGE_META.professors.description },
  },
  schools: {
    title: REPORT_PAGE_META.schools.title,
    icon: PAGE_ICONS.schools,
    entity: 'school',
    placeholder: 'نام مدرسه یا مدیر',
    period: true,
    periodModes: false,
    first: ['q', 'province', 'city', 'region'],
    more: [],
    desc: { term: REPORT_PAGE_META.schools.description, module: REPORT_PAGE_META.schools.description },
  },
  'teacher-performance': {
    title: REPORT_PAGE_META['teacher-performance'].title,
    icon: PAGE_ICONS['teacher-performance'],
    entity: 'teacherPerf',
    placeholder: 'نام، کد پرسنلی یا تلفن',
    period: true,
    periodModes: false,
    first: ['q', 'province', 'city', 'region'],
    more: ['school'],
    desc: {
      term: 'عملکرد معلمان راهنما در نیم‌سال انتخاب‌شده.',
      module: 'عملکرد معلمان راهنما در پودمان انتخاب‌شده.',
    },
  },
  'school-performance': {
    title: REPORT_PAGE_META['school-performance'].title,
    icon: PAGE_ICONS['school-performance'],
    entity: 'schoolPerf',
    placeholder: 'نام مدرسه یا مدیر',
    period: true,
    periodModes: false,
    first: ['q', 'province', 'city', 'region'],
    more: [],
    desc: {
      term: 'عملکرد مدارس در نیم‌سال انتخاب‌شده.',
      module: 'عملکرد مدارس در پودمان انتخاب‌شده.',
    },
  },
  'professor-performance': {
    title: REPORT_PAGE_META['professor-performance'].title,
    icon: PAGE_ICONS['professor-performance'],
    entity: 'profPerf',
    placeholder: 'نام، کد استادی یا تلفن',
    fac: true,
    period: true,
    periodModes: false,
    first: ['q', 'province', 'city', 'faculty'],
    more: [],
    desc: {
      term: 'عملکرد اساتید راهنما در نیم‌سال انتخاب‌شده.',
      module: 'عملکرد اساتید راهنما در پودمان انتخاب‌شده.',
    },
  },
  faculties: {
    title: REPORT_PAGE_META.faculties.title,
    icon: PAGE_ICONS.faculties,
    entity: 'faculty',
    placeholder: 'نام دانشکده یا رئیس',
    fac: true,
    period: true,
    periodModes: false,
    first: ['q', 'province', 'city'],
    more: [],
    desc: { term: REPORT_PAGE_META.faculties.description, module: REPORT_PAGE_META.faculties.description },
  },
  provinces: {
    title: REPORT_PAGE_META.provinces.title,
    icon: PAGE_ICONS.provinces,
    entity: 'province',
    placeholder: 'نام استان یا رئیس',
    period: true,
    periodModes: false,
    first: ['q'],
    more: [],
    desc: { term: REPORT_PAGE_META.provinces.description, module: REPORT_PAGE_META.provinces.description },
  },
  'faculty-performance': {
    title: REPORT_PAGE_META['faculty-performance'].title,
    icon: PAGE_ICONS['faculty-performance'],
    entity: 'facPerf',
    placeholder: 'نام دانشکده یا رئیس',
    fac: true,
    period: true,
    periodModes: false,
    first: ['q', 'province', 'city'],
    more: [],
    desc: {
      term: 'عملکرد دانشکده‌ها در نیم‌سال انتخاب‌شده.',
      module: 'عملکرد دانشکده‌ها در پودمان انتخاب‌شده.',
    },
  },
  'province-performance': {
    title: REPORT_PAGE_META['province-performance'].title,
    icon: PAGE_ICONS['province-performance'],
    entity: 'provPerf',
    placeholder: 'نام استان یا رئیس',
    period: true,
    periodModes: false,
    first: ['q'],
    more: [],
    desc: {
      term: 'عملکرد استان‌ها در نیم‌سال انتخاب‌شده.',
      module: 'عملکرد استان‌ها در پودمان انتخاب‌شده.',
    },
  },
};

export const DEFAULT_REPORT_SLUG: ReportSlug = 'learners';

export function themeForSlug(slug: ReportSlug) {
  return REPORT_THEMES.find((th) => th.slugs.includes(slug));
}

export function themeIdForSlug(slug: ReportSlug): string | undefined {
  return themeForSlug(slug)?.id;
}

export const TERMS = [
  { id: 't0', label: 'نیم‌سال اول ۱۴۰۵–۱۴۰۶ (جاری)' },
  { id: 't1', label: 'نیم‌سال دوم ۱۴۰۴–۱۴۰۵' },
  { id: 't2', label: 'نیم‌سال اول ۱۴۰۴–۱۴۰۵' },
] as const;

export const MODULES = [
  { id: 'm0', label: 'پودمان ۱ — آشنایی با محیط کار' },
  { id: 'm1', label: 'پودمان ۲ — مهارت‌های پایه (جاری)' },
  { id: 'm2', label: 'پودمان ۳ — کارورزی تخصصی' },
  { id: 'm3', label: 'پودمان ۴ — ارزیابی نهایی' },
] as const;

export const CUR_PERIOD = { term: 't0', module: 'm1' } as const;

/** سقف واکشی یک‌بارهٔ جدول گزارش (بدون پجینیشن — فقط اسکرول). */
export const REPORT_LIST_LIMIT = 5000;

/** سازگاری سرویس ماکت؛ همان سقف لیست. */
export const PAGE_SIZE = REPORT_LIST_LIMIT;
export const COMPARE_MAX = 4;
export const COMPARE_MIN = 2;

export const FILTER_LABELS: Record<string, string> = {
  province: 'استان',
  city: 'شهر',
  region: 'منطقه',
  school: 'مدرسه',
  faculty: 'دانشکده',
  professor: 'استاد راهنما',
  teacher: 'معلم راهنما',
  course: 'درس',
  major: 'رشته',
  status: 'وضعیت',
  term: 'دوره',
};
