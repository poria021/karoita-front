import {
  appendSearchParam,
} from '@/lib/dashboard-url-state';

/**
 * کاتالوگ مسیرهای زنده. مسیرهای برنامه‌ریزی‌شده در `planned-routes.ts` است.
 * این هلپرها Edge-safeاند (بدون Nest / Zustand / API مرورگر).
 */

const AUTH_BASE = '/auth';
const ADMIN_GATE_PATH = '/admin';
const KARVITA_BASE = '/karvita';
const KARVITA_ADMIN_BASE = `${KARVITA_BASE}/admin`;
const KARVITA_ADMIN_DASHBOARD = `${KARVITA_ADMIN_BASE}/dashboard`;
/** صفحات CMS عمومی بین لندینگ و ورود. */
const MARKETING_CMS_BASE = '/p';

function normalizeAppPath(pathname: string): string {
  if (!pathname) return '/';
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

export function isAuthPath(pathname: string): boolean {
  const path = normalizeAppPath(pathname);
  return (
    path === AUTH_BASE ||
    path.startsWith(`${AUTH_BASE}/`) ||
    path === ADMIN_GATE_PATH
  );
}

/** سطح CMS عمومی زیر `/p` — نه ادیتور ادمین. */
export function isMarketingCmsPath(pathname: string): boolean {
  const path = normalizeAppPath(pathname);
  return path === MARKETING_CMS_BASE || path.startsWith(`${MARKETING_CMS_BASE}/`);
}

const COURSE_MATERIALS_PATH = /^\/karvita\/internships\/(\d+)\/materials$/;

/** سطح عددی مسیر جزوات؛ مسیرهای دیگر `null`. */
export function courseMaterialsLevel(pathname: string): number | null {
  const match = COURSE_MATERIALS_PATH.exec(normalizeAppPath(pathname));
  if (!match) return null;
  const level = Number(match[1]);
  return Number.isInteger(level) && level >= 1 ? level : null;
}

/** پوستهٔ داشبورد `/(app)` — سوییچ تم هدر اینجاست. */
export function isAppShellPath(pathname: string): boolean {
  const path = normalizeAppPath(pathname);
  return path === KARVITA_BASE || path.startsWith(`${KARVITA_BASE}/`);
}

/**
 * صفحهٔ ادمین زیر `/karvita/admin`.
 * دستیار مدیر ارشد ماژول اجرایی می‌بیند؛ ساخت حساب سازمانی و تنظیمات ترم فقط مدیر ارشد است.
 */
export function isAdminControlPlanePath(pathname: string): boolean {
  const path = normalizeAppPath(pathname);
  return (
    path === KARVITA_ADMIN_DASHBOARD ||
    path.startsWith(`${KARVITA_ADMIN_BASE}/`)
  );
}

export const RouteService = {
  marketing: {
    home: (): string => '/',
    loginSelect: (): string => '/login-select',
    offline: (): string => '/offline',
    /**
     * هاب صفحات CMS عمومی. ادیتور ادمین `/karvita/admin/landing-cms` می‌ماند.
     */
    cmsPagesBase: (): string => MARKETING_CMS_BASE,
    cmsPage: (slug: string): string => {
      const clean = slug.replace(/^\/+|\/+$/g, '');
      return clean ? `${MARKETING_CMS_BASE}/${clean}` : MARKETING_CMS_BASE;
    },
    isMarketingCmsPath,
  },

  auth: {
    login: (): string => `${AUTH_BASE}/login`,
    register: (): string => `${AUTH_BASE}/register`,
    forgot: (): string => `${AUTH_BASE}/forgot`,
    adminGate: (): string => ADMIN_GATE_PATH,
    isAuthPath,
  },

  karvita: {
    dashboard: (): string => '/karvita/dashboard',
    adminDashboard: (): string => KARVITA_ADMIN_DASHBOARD,
    profile: (role: string): string => `/karvita/${role}/profile`,
    profileSecurity: (role: string): string =>
      `/karvita/${role}/profile?tab=security`,

    dailyApprovals: (kind?: 'internship' | 'apprenticeship'): string => {
      const base = '/karvita/daily-approvals';
      return kind ? appendSearchParam(base, 'kind', kind) : base;
    },
    /** ایندکس سرفصل redirect است؛ UI زنده زیر `/admin/syllabus/*`. */
    syllabusConfig: (): string => `${KARVITA_ADMIN_BASE}/syllabus`,
    syllabusCourseOfferings: (): string =>
      `${KARVITA_ADMIN_BASE}/syllabus/course-offerings`,
    syllabusTermSettings: (): string =>
      `${KARVITA_ADMIN_BASE}/syllabus/term-settings`,
    /** تعریف داینامیک دروس و زیرمجموعه‌ها توسط مدیر ارشد. */
    syllabusCourseCatalog: (): string =>
      `${KARVITA_ADMIN_BASE}/syllabus/courses`,
    onboardingApprovals: (
      tab?: 'pending_admin' | 'approved' | 'rejected'
    ): string => {
      const base = `${KARVITA_ADMIN_BASE}/onboarding-approvals`;
      return tab ? appendSearchParam(base, 'tab', tab) : base;
    },
    /** بدون سطح → redirect به L1؛ با سطح → زیرماژول سایدبار. */
    internshipSelection: (level?: number): string =>
      level == null
        ? '/karvita/internships'
        : `/karvita/internships/${level}`,
    /** صندوق جزوات همان درس — یک URL برای هر سطح. */
    courseMaterials: (level: number): string =>
      `/karvita/internships/${level}/materials`,
    organizationalCapacities: (
      kind?: 'internship' | 'apprenticeship'
    ): string => {
      const base = '/karvita/capacities';
      return kind ? appendSearchParam(base, 'kind', kind) : base;
    },
    adminUserCreation: (): string => `${KARVITA_ADMIN_BASE}/user-creation`,
    /** ماتریس دسترسی گزارش‌ها — فقط مدیر ارشد. */
    reportAccess: (): string => `${KARVITA_ADMIN_BASE}/report-access`,
    /**
     * گزارش‌گیری پنل مدیر ارشد.
     * بدون اسلاگ → ایندکس (redirect به اولین گزارش)؛ با اسلاگ → صفحهٔ گزارش.
     */
    reports: (slug?: string): string => {
      const base = `${KARVITA_ADMIN_BASE}/reports`;
      if (!slug) return base;
      return `${base}/${slug.replace(/^\/+|\/+$/g, '')}`;
    },
    /**
     * گزارش‌گیری نقش‌های سازمانی (مثل سازمان مرکزی).
     * مسیر جدا از کنترل‌پلین ادمین — هم‌تراز پروتوتایپ `/karvita/reports`.
     */
    orgReports: (slug?: string): string => {
      const base = `${KARVITA_BASE}/reports`;
      if (!slug) return base;
      return `${base}/${slug.replace(/^\/+|\/+$/g, '')}`;
    },
    organizationalStructure: (
      tab?:
        | 'provinces'
        | 'cities'
        | 'districts'
        | 'schools'
        | 'majors'
        | 'faculties'
    ): string => {
      const base = `${KARVITA_ADMIN_BASE}/organizational-structure`;
      return tab ? appendSearchParam(base, 'tab', tab) : base;
    },
    landingCms: (tab?: 'banners' | 'socials' | 'products'): string => {
      const base = `${KARVITA_ADMIN_BASE}/landing-cms`;
      return tab ? appendSearchParam(base, 'tab', tab) : base;
    },
    /**
     * هاب اطلاعیه/تبلیغ/دریافتی/اعلان.
     * تب‌های مجاز نقش‌محورند — `announcementsHubTabsFor` در bulletin-rules.
     */
    announcements: (
      tab?: 'announcement' | 'advertisement' | 'received' | 'notifications'
    ): string => {
      const base = '/karvita/announcements';
      return tab ? appendSearchParam(base, 'tab', tab) : base;
    },

    isAdminControlPlanePath,
    isAppShellPath,
  },
} as const;
