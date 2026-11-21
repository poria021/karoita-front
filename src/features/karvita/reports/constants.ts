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
 * کل ماژول گزارش‌گیری (منو، ریل، صفحات، دسترسی گزارش).
 * روی `main` موقتاً خاموش شده بود؛ روی `dev` دوباره فعال است.
 */
export const REPORTS_MODULE_ENABLED = true;

/** مقایسه گزارش‌ها برای اسلاگ‌های COMPARE_REPORT_SLUGS (و دسترسی سازمانی @cmp) فعال است. */
export const REPORT_COMPARE_ENABLED = true;

/**
 * گزارش نمرات فراگیران زنده است؛ نمایش صفحه با `GET /reports/access/me`
 * و `learners_grades` با `status: active` کنترل می‌شود.
 */
export const REPORT_SCORES_ENABLED = true;

/** نقش‌هایی که حتی اگر فلگ سراسری خاموش شود، نمرات برایشان زنده می‌ماند. */
export const REPORT_SCORES_ROLE_ALLOWLIST = [
  'supervisor_professor',
  'super_admin',
] as const;

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
const SCORES_ROLE_SET = new Set<string>(REPORT_SCORES_ROLE_ALLOWLIST);

export function isReportSlug(s: string): s is ReportSlug {
  return SLUG_SET.has(s);
}

export function isEnabledReportSlug(
  slug: ReportSlug,
  role?: string | null
): boolean {
  if (!REPORTS_MODULE_ENABLED) return false;
  if (slug !== 'scores') return true;
  if (REPORT_SCORES_ENABLED) return true;
  if (role == null) return false;
  return SCORES_ROLE_SET.has(role);
}

/** برای live-nav: مسیر اسلاگ وقتی حداقل یک نقش مجاز باشد زنده است. */
export function isLiveEnabledReportSlug(slug: ReportSlug): boolean {
  if (!REPORTS_MODULE_ENABLED) return false;
  if (slug !== 'scores') return true;
  if (REPORT_SCORES_ENABLED) return true;
  return SCORES_ROLE_SET.size > 0;
}

export function filterEnabledReportSlugs(
  slugs: readonly ReportSlug[],
  role?: string | null
): ReportSlug[] {
  return slugs.filter((slug) => isEnabledReportSlug(slug, role));
}

/** تم‌های گزارش برای منو/ریل — اسلاگ‌های خاموش حذف شده‌اند. */
export function enabledReportThemes(
  role?: string | null
): typeof REPORT_THEMES {
  return REPORT_THEMES.map((theme) => ({
    ...theme,
    slugs: filterEnabledReportSlugs(theme.slugs, role),
  })).filter((theme) => theme.slugs.length > 0);
}

export const ENABLED_REPORT_SLUGS: readonly ReportSlug[] =
  ALL_REPORT_SLUGS.filter(isLiveEnabledReportSlug);

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
    placeholder: 'جست‌وجوی نام فراگیر',
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
    placeholder: 'جست‌وجوی نام',
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
    placeholder: 'جست‌وجوی نام',
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
    placeholder: 'جست‌وجوی نام',
    // شهر برای این گزارش نیست؛ فقط کلیدهایی که در پاسخ filters می‌آیند دیده می‌شوند.
    first: ['q', 'period', 'province', 'region', 'faculty'],
    more: ['school', 'professor', 'teacher'],
    learner: true,
    desc: {
      term:
        'هر ردیف یک فراگیر در نیم‌سال انتخاب‌شده است. برای دیدن نمرهٔ پایانی و وضعیت هر درس، «مشاهده نمرات» را بزنید.',
      module:
        'هر ردیف یک فراگیر در پودمان انتخاب‌شده است. برای دیدن نمرهٔ پایانی و وضعیت هر درس، «مشاهده نمرات» را بزنید.',
    },
  },
  teachers: {
    title: REPORT_PAGE_META.teachers.title,
    icon: PAGE_ICONS.teachers,
    entity: 'teacher',
    placeholder: 'جست‌وجوی نام',
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
    placeholder: 'جست‌وجوی نام',
    period: true,
    periodModes: false,
    first: ['q', 'province', 'city', 'region'],
    more: [],
    desc: { term: REPORT_PAGE_META.principals.description, module: REPORT_PAGE_META.principals.description },
  },
  professors: {
    title: REPORT_PAGE_META.professors.title,
    icon: PAGE_ICONS.professors,
    entity: 'professor',
    placeholder: 'جست‌وجوی نام',
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
    placeholder: 'جست‌وجوی نام',
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
    placeholder: 'جست‌وجوی نام',
    period: true,
    periodModes: false,
    first: ['q', 'province', 'city', 'region'],
    more: ['school', 'teacher'],
    desc: {
      term: 'عملکرد معلمان راهنما در نیم‌سال انتخاب‌شده.',
      module: 'عملکرد معلمان راهنما در پودمان انتخاب‌شده.',
    },
  },
  'school-performance': {
    title: REPORT_PAGE_META['school-performance'].title,
    icon: PAGE_ICONS['school-performance'],
    entity: 'schoolPerf',
    placeholder: 'جست‌وجوی نام مدرسه',
    period: true,
    periodModes: false,
    first: ['q', 'province', 'city', 'region'],
    more: ['school', 'teacher'],
    desc: {
      term: 'عملکرد مدارس در نیم‌سال انتخاب‌شده.',
      module: 'عملکرد مدارس در پودمان انتخاب‌شده.',
    },
  },
  'professor-performance': {
    title: REPORT_PAGE_META['professor-performance'].title,
    icon: PAGE_ICONS['professor-performance'],
    entity: 'profPerf',
    placeholder: 'جست‌وجوی نام',
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
    placeholder: 'جست‌وجوی نام',
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
    placeholder: 'جست‌وجوی نام استان',
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
    placeholder: 'جست‌وجوی نام دانشکده',
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
    placeholder: 'جست‌وجوی نام استان',
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

/** سقف واکشی یک‌بارهٔ جدول گزارش (بدون پجینیشن — فقط اسکرول). */
export const REPORT_LIST_LIMIT = 5000;

/** سقف پیش‌فرض مقایسه (بقیهٔ اسلاگ‌های مقایسه‌پذیر). */
export const COMPARE_MAX = 10;
/**
 * سقف مقایسهٔ عملکرد استان‌ها — همهٔ استان‌های کشور (~۳۱).
 * مقایسه API جدا ندارد و از همان ردیف‌های جدول ساخته می‌شود؛
 * این سقف فقط انتخاب کلاینتی را باز می‌کند و درخواست اضافه به سرور نمی‌زند.
 */
export const COMPARE_MAX_PROVINCE_PERFORMANCE = 31;
/**
 * سقف مقایسهٔ عملکرد دانشکده‌ها — همهٔ ردیف‌های بارگذاری‌شده؛
 * همان منطق استان‌ها (بدون API جدا / فشار اضافه روی سرور).
 */
export const COMPARE_MAX_FACULTY_PERFORMANCE = REPORT_LIST_LIMIT;
export const COMPARE_MIN = 2;

/** سقف مقایسه به ازای اسلاگ گزارش. */
export function compareMaxForSlug(slug: ReportSlug): number {
  if (slug === 'province-performance') return COMPARE_MAX_PROVINCE_PERFORMANCE;
  if (slug === 'faculty-performance') return COMPARE_MAX_FACULTY_PERFORMANCE;
  return COMPARE_MAX;
}

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
