import { isLiveSidebarPath } from '@/lib/live-nav-paths';
import { RouteService } from '@/services/route.service';
import type { UserRole } from '@/types/auth';

/**
 * Role Strategy Pattern (rule 00, #10): every role-driven decision about
 * sidebar menus, badges, layout width, or permissions MUST be read from this
 * map — never branch on `role === '...'` inline inside components.
 */

/** One sidebar entry. `icon` MUST be a key that exists in `src/utils/iconMap.ts`. */
export interface SidebarMenuItem {
  title: string;
  path: string;
  icon: string;
}

export interface RoleStrategyConfig {
  /** Farsi role label, e.g. "دانشجو". */
  label: string;
  /** Farsi badge shown under the role label, e.g. "آموزش علمی نظری". */
  badge: string;
  /** Icon key (see `iconMap.ts`) representing this role in the sidebar footer/header avatar. */
  roleIcon: string;
  /**
   * Legacy width token — dashboard main content is full-bleed (`max-w-none`).
   * Kept on the strategy map so role layouts stay centralized (rule 00 #10).
   */
  layoutWidthClass: string;
  /**
   * When true, sidebar modules stay locked until `user.approved`
   * (mirrors original-karvita.html `!isApproved && role !== super_admin`).
   */
  gateModulesUntilApproved: boolean;
  /** Role-scoped navigation, in display order. */
  sidebarMenu: SidebarMenuItem[];
  /** PBAC permission strings granted to this role. */
  permissions: string[];
}

const DASHBOARD_ITEM: SidebarMenuItem = {
  title: 'میز کار',
  path: RouteService.karvita.dashboard(),
  icon: 'fa-home',
};

const ADMIN_DASHBOARD_ITEM: SidebarMenuItem = {
  title: 'میز کار مدیریت',
  path: RouteService.karvita.adminDashboard(),
  icon: 'fa-home',
};

const STANDARD_REPORTS_ITEM: SidebarMenuItem = {
  title: 'گزارش‌های استاندارد',
  path: RouteService.karvita.standardReports(),
  icon: 'fa-file-invoice',
};

const COMPARATIVE_REPORTS_ITEM: SidebarMenuItem = {
  title: 'گزارش‌های مقایسه‌ای',
  path: RouteService.karvita.comparativeReports(),
  icon: 'fa-chart-column',
};

const MANAGE_ADS_ITEM: SidebarMenuItem = {
  title: 'مدیریت انتشارات و اعلانات',
  path: RouteService.karvita.manageAds(),
  icon: 'fa-bullhorn',
};

/** Single source of truth for every role's sidebar, badge, and PBAC permissions. */
export const ROLE_STRATEGY_MAP: Record<UserRole, RoleStrategyConfig> = {
  student: {
    label: 'دانشجو',
    badge: 'آموزش علمی نظری',
    roleIcon: 'fa-graduation-cap',
    layoutWidthClass: 'max-w-none',
    gateModulesUntilApproved: true,
    sidebarMenu: [
      DASHBOARD_ITEM,
      {
        title: 'انتخاب واحد کارورزی',
        path: RouteService.karvita.internshipSelection(),
        icon: 'fa-graduation-cap',
      },
      {
        title: 'گزارش روزانه',
        path: RouteService.karvita.dailyReports(),
        icon: 'fa-clipboard-list',
      },
    ],
    permissions: ['dashboard.view', 'internship.select', 'daily-report.submit'],
  },

  skill_learner: {
    label: 'مهارت‌آموز',
    badge: 'آموزش فنی و کارگاهی',
    roleIcon: 'fa-screwdriver-wrench',
    layoutWidthClass: 'max-w-none',
    gateModulesUntilApproved: true,
    sidebarMenu: [
      DASHBOARD_ITEM,
      {
        title: 'انتخاب واحد کارآموزی',
        path: RouteService.karvita.internshipSelection(),
        icon: 'fa-screwdriver-wrench',
      },
      {
        title: 'گزارش روزانه',
        path: RouteService.karvita.dailyReports(),
        icon: 'fa-clipboard-list',
      },
    ],
    permissions: ['dashboard.view', 'internship.select', 'daily-report.submit'],
  },

  supervisor_professor: {
    label: 'استاد راهنما',
    badge: 'ارزیاب علمی دانشگاه',
    roleIcon: 'fa-user-tie',
    layoutWidthClass: 'max-w-none',
    gateModulesUntilApproved: true,
    sidebarMenu: [
      DASHBOARD_ITEM,
      {
        title: 'ارزیابی گزارش‌های فراگیران',
        path: RouteService.karvita.dailyApprovals(),
        icon: 'fa-clipboard-check',
      },
      {
        title: 'پیکربندی ظرفیت‌ها',
        path: RouteService.karvita.organizationalCapacities(),
        icon: 'fa-chart-pie',
      },
      STANDARD_REPORTS_ITEM,
      COMPARATIVE_REPORTS_ITEM,
    ],
    permissions: [
      'dashboard.view',
      'daily-approval.review',
      'capacity.configure',
      'reports.view',
    ],
  },

  mentor_teacher: {
    label: 'معلم راهنما',
    badge: 'ناظر و هدایت‌گر مدرسه',
    roleIcon: 'fa-chalkboard-user',
    layoutWidthClass: 'max-w-none',
    gateModulesUntilApproved: true,
    sidebarMenu: [
      DASHBOARD_ITEM,
      {
        title: 'ارزیابی گزارش‌های فراگیران',
        path: RouteService.karvita.dailyApprovals(),
        icon: 'fa-clipboard-check',
      },
      STANDARD_REPORTS_ITEM,
      COMPARATIVE_REPORTS_ITEM,
    ],
    permissions: ['dashboard.view', 'daily-approval.review', 'reports.view'],
  },

  school_principal: {
    label: 'مدیر مدرسه',
    badge: 'مدیریت کل واحد آموزشی',
    roleIcon: 'fa-school',
    layoutWidthClass: 'max-w-none',
    gateModulesUntilApproved: true,
    sidebarMenu: [
      DASHBOARD_ITEM,
      {
        title: 'مدیریت کارورزان',
        path: RouteService.karvita.traineesManagement(),
        icon: 'fa-id-card',
      },
      {
        title: 'ثبت‌نام مهارت‌آموزان',
        path: RouteService.karvita.studentsList(),
        icon: 'fa-user-group',
      },
      STANDARD_REPORTS_ITEM,
      COMPARATIVE_REPORTS_ITEM,
    ],
    permissions: [
      'dashboard.view',
      'trainee.manage',
      'student.manage',
      'reports.view',
    ],
  },

  regional_edu_admin: {
    label: 'آموزش پرورش منطقه',
    badge: 'نظارت منطقه‌ای آموزش',
    roleIcon: 'fa-map-location-dot',
    layoutWidthClass: 'max-w-none',
    gateModulesUntilApproved: true,
    sidebarMenu: [
      DASHBOARD_ITEM,
      {
        title: 'مکان‌ها و مناطق',
        path: RouteService.karvita.locations(),
        icon: 'fa-map',
      },
      STANDARD_REPORTS_ITEM,
      COMPARATIVE_REPORTS_ITEM,
    ],
    permissions: ['dashboard.view', 'location.manage', 'reports.view'],
  },

  faculty_role: {
    label: 'دانشکده',
    badge: 'مدیریت پردیس تابعه',
    roleIcon: 'fa-university',
    layoutWidthClass: 'max-w-none',
    gateModulesUntilApproved: true,
    sidebarMenu: [
      DASHBOARD_ITEM,
      STANDARD_REPORTS_ITEM,
      COMPARATIVE_REPORTS_ITEM,
      MANAGE_ADS_ITEM,
    ],
    permissions: ['dashboard.view', 'reports.view', 'ads.manage'],
  },

  provincial_university: {
    label: 'دانشگاه استانی',
    badge: 'امور پردیس‌های استانی',
    roleIcon: 'fa-university',
    layoutWidthClass: 'max-w-none',
    gateModulesUntilApproved: true,
    sidebarMenu: [
      DASHBOARD_ITEM,
      {
        title: 'مکان‌ها و پردیس‌ها',
        path: RouteService.karvita.locations(),
        icon: 'fa-map',
      },
      STANDARD_REPORTS_ITEM,
      COMPARATIVE_REPORTS_ITEM,
      MANAGE_ADS_ITEM,
    ],
    permissions: [
      'dashboard.view',
      'location.manage',
      'reports.view',
      'ads.manage',
    ],
  },

  assistant_admin: {
    label: 'دستیار مدیر',
    badge: 'معاونت اجرایی و ستادی',
    roleIcon: 'fa-user-gear',
    layoutWidthClass: 'max-w-none',
    gateModulesUntilApproved: true,
    sidebarMenu: [
      DASHBOARD_ITEM,
      STANDARD_REPORTS_ITEM,
      COMPARATIVE_REPORTS_ITEM,
    ],
    permissions: ['dashboard.view', 'reports.view'],
  },

  central_organization: {
    label: 'سازمان مرکزی',
    badge: 'مدیریت کلان کشوری',
    roleIcon: 'fa-building-columns',
    layoutWidthClass: 'max-w-none',
    gateModulesUntilApproved: true,
    sidebarMenu: [
      DASHBOARD_ITEM,
      STANDARD_REPORTS_ITEM,
      COMPARATIVE_REPORTS_ITEM,
      MANAGE_ADS_ITEM,
    ],
    permissions: ['dashboard.view', 'reports.view', 'ads.manage'],
  },

  super_admin: {
    label: 'مدیر ارشد',
    badge: 'مدیریت عالی و حاکمیتی',
    roleIcon: 'fa-user-shield',
    layoutWidthClass: 'max-w-none',
    gateModulesUntilApproved: false,
    sidebarMenu: [
      ADMIN_DASHBOARD_ITEM,
      {
        title: 'بررسی مدارک هویتی',
        path: RouteService.karvita.onboardingApprovals(),
        icon: 'fa-id-card',
      },
      {
        title: 'مدیریت دسترسی‌ها',
        path: RouteService.karvita.userPermissions(),
        icon: 'fa-user-gear',
      },
      {
        title: 'ایجاد حساب‌های سازمانی',
        path: RouteService.karvita.adminUserCreation(),
        icon: 'fa-user-plus',
      },
      {
        title: 'مدیریت ترم و سرفصل',
        path: RouteService.karvita.syllabusConfig(),
        icon: 'fa-rectangle-list',
      },
      {
        title: 'ساختار سازمانی',
        path: RouteService.karvita.organizationalStructure(),
        icon: 'fa-network-wired',
      },
      MANAGE_ADS_ITEM,
      STANDARD_REPORTS_ITEM,
      COMPARATIVE_REPORTS_ITEM,
    ],
    permissions: [
      'dashboard.view',
      'onboarding.review',
      'permission.manage',
      'user.create',
      'syllabus.manage',
      'organization.manage',
      'ads.manage',
      'reports.view',
    ],
  },
};

/** Typed accessor — unknown/invalid roles fall back to `student` (no throw). */
export function getRoleStrategy(
  role: UserRole | string | null | undefined
): RoleStrategyConfig {
  if (role && Object.prototype.hasOwnProperty.call(ROLE_STRATEGY_MAP, role)) {
    return ROLE_STRATEGY_MAP[role as UserRole];
  }
  if (process.env.NODE_ENV !== 'production' && role) {
    console.warn(
      `[RoleStrategyMap] نقش ناشناخته «${String(role)}» — بازگشت به student.`
    );
  }
  return ROLE_STRATEGY_MAP.student;
}

/**
 * Sidebar entries that currently have a live page.
 * Full IA remains in `sidebarMenu`; unfinished modules stay hidden (no 404 links).
 */
export function getVisibleSidebarMenu(
  role: UserRole | string | null | undefined
): SidebarMenuItem[] {
  return getRoleStrategy(role).sidebarMenu.filter((item) =>
    isLiveSidebarPath(item.path)
  );
}

/**
 * Whether domain modules (sidebar + routes) are unlocked for this user.
 * Profile remains reachable even when this returns false.
 *
 * UX only — not API authorization (rule 45).
 */
export function areKarvitaModulesUnlocked(user: {
  role: UserRole;
  approved: boolean;
}): boolean {
  const strategy = getRoleStrategy(user.role);
  if (!strategy.gateModulesUntilApproved) return true;
  return user.approved;
}

/** UX helper — browser role can be forged; never treat as authz proof. */
export function isSuperAdminRole(
  role: UserRole | string | null | undefined
): boolean {
  return role === 'super_admin';
}

/**
 * Whether `user.role` lists `permission` in RoleStrategyMap.
 * Client-only gate for menus/buttons — Nest must re-check for real mutations.
 */
export function hasPermission(
  user: { role: UserRole } | null | undefined,
  permission: string
): boolean {
  if (!user) return false;
  return getRoleStrategy(user.role).permissions.includes(permission);
}
