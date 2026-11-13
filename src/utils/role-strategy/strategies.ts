import {
  orgReportsSidebarEntries,
  orgReportsSidebarGroup,
} from '@/features/karvita/reports/lib/org-report-access';
import { PlannedRoutes } from '@/services/planned-routes';
import { RouteService } from '@/services/route.service';

import {
  isSidebarMenuGroup,
  type RoleStrategyMap,
  type SidebarMenuEntry,
  type SidebarMenuItem,
} from '@/utils/role-strategy/types';

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

const MANAGE_ADS_ITEM: SidebarMenuItem = {
  title: 'اطلاعیه‌ها و اعلانات',
  path: RouteService.karvita.announcements(),
  icon: 'fa-bullhorn',
};

/** پنل‌های غیرستادی — همان مسیر هاب؛ عنوان ماژول یکسان است. */
const MANAGE_ANNOUNCEMENTS_ITEM: SidebarMenuItem = {
  ...MANAGE_ADS_ITEM,
};

/** دانشجو/مهارت‌آموز — مشاهدهٔ دریافتی‌ها و اعلان‌ها (بدون انتشار). */
const INBOX_ANNOUNCEMENTS_ITEM: SidebarMenuItem = {
  title: 'اطلاعیه‌ها و اعلان‌ها',
  path: RouteService.karvita.announcements(),
  icon: 'fa-bullhorn',
};

function omitSidebarPaths(
  menu: readonly SidebarMenuEntry[],
  paths: readonly string[]
): SidebarMenuEntry[] {
  const blocked = new Set(paths);
  const next: SidebarMenuEntry[] = [];
  for (const entry of menu) {
    if (isSidebarMenuGroup(entry)) {
      const children = entry.children.filter(
        (child) => !blocked.has(child.path)
      );
      if (children.length > 0) {
        next.push({ ...entry, children });
      }
      continue;
    }
    if (!blocked.has(entry.path)) next.push(entry);
  }
  return next;
}

const SENIOR_ADMIN_SIDEBAR_MENU: SidebarMenuEntry[] = [
  ADMIN_DASHBOARD_ITEM,
  {
    title: 'بررسی مدارک هویتی',
    path: RouteService.karvita.onboardingApprovals(),
    icon: 'fa-id-card',
  },
  {
    title: 'مدیریت محتوای لندینگ',
    path: RouteService.karvita.landingCms(),
    icon: 'fa-bullhorn',
  },
  {
    kind: 'group',
    title: 'مدیریت سازمانی',
    icon: 'fa-network-wired',
    children: [
      {
        title: 'ساختار سازمانی',
        path: RouteService.karvita.organizationalStructure(),
        icon: 'fa-network-wired',
      },
      {
        title: 'ایجاد حساب‌های سازمانی',
        path: RouteService.karvita.adminUserCreation(),
        icon: 'fa-user-plus',
      },
      {
        title: 'دسترسی گزارش‌ها',
        path: RouteService.karvita.reportAccess(),
        icon: 'fa-user-shield',
      },
    ],
  },
  {
    kind: 'group',
    title: 'مدیریت ترم و سرفصل',
    icon: 'fa-screwdriver-wrench',
    children: [
      {
        title: 'تعریف دروس',
        path: RouteService.karvita.syllabusCourseCatalog(),
        icon: 'fa-book-open',
      },
      {
        title: 'ارائه و سرفصل دروس',
        path: RouteService.karvita.syllabusCourseOfferings(),
        icon: 'fa-sliders',
      },
      {
        title: 'تنظیمات عمومی ترم‌ها',
        path: RouteService.karvita.syllabusTermSettings(),
        icon: 'fa-clock-rotate-left',
      },
    ],
  },
  {
    title: 'گزارش‌گیری',
    path: RouteService.karvita.reports('learners'),
    icon: 'fa-file-invoice',
  },
  MANAGE_ADS_ITEM,
];

const SENIOR_ADMIN_PERMISSIONS = [
  'dashboard.view',
  'onboarding.review',
  'user.create',
  'syllabus.manage',
  'syllabus.term-settings',
  'organization.manage',
  'ads.manage',
] as const;

/**
 * استراتژی نقش‌ها — لیبل، منوی سایدبار، عرض لایوت و permissions.
 * شرط‌های نقش در UI از این نقشه خوانده شود؛ `role === '...'` پراکنده ممنوع است.
 */
export const ROLE_STRATEGY_MAP: RoleStrategyMap = {
  student: {
    label: 'دانشجو',
    badge: 'آموزش علمی نظری',
    roleIcon: 'fa-graduation-cap',
    layoutWidthClass: 'max-w-none',
    gateModulesUntilApproved: true,
    sidebarMenu: [
      DASHBOARD_ITEM,
      // قبل از انتخاب واحد تا زیر گروه بازِ کارورزی پنهان نماند.
      INBOX_ANNOUNCEMENTS_ITEM,
      {
        kind: 'group',
        title: 'انتخاب واحد کارورزی',
        icon: 'fa-graduation-cap',
        children: [
          {
            title: 'کارورزی ۱',
            path: RouteService.karvita.internshipSelection(1),
            icon: 'fa-graduation-cap',
            iconBadge: 1,
          },
          {
            title: 'کارورزی ۲',
            path: RouteService.karvita.internshipSelection(2),
            icon: 'fa-graduation-cap',
            iconBadge: 2,
          },
          {
            title: 'کارورزی ۳',
            path: RouteService.karvita.internshipSelection(3),
            icon: 'fa-graduation-cap',
            iconBadge: 3,
          },
          {
            title: 'کارورزی ۴',
            path: RouteService.karvita.internshipSelection(4),
            icon: 'fa-graduation-cap',
            iconBadge: 4,
          },
        ],
      },
      {
        title: 'گزارش روزانه',
        path: PlannedRoutes.dailyReports(),
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
      INBOX_ANNOUNCEMENTS_ITEM,
      {
        kind: 'group',
        title: 'انتخاب واحد کارآموزی',
        icon: 'fa-graduation-cap',
        children: [
          {
            title: 'کارآموزی ۱',
            path: RouteService.karvita.internshipSelection(1),
            icon: 'fa-graduation-cap',
            iconBadge: 1,
          },
          {
            title: 'کارآموزی ۲',
            path: RouteService.karvita.internshipSelection(2),
            icon: 'fa-graduation-cap',
            iconBadge: 2,
          },
        ],
      },
      {
        title: 'گزارش روزانه',
        path: PlannedRoutes.dailyReports(),
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
      orgReportsSidebarGroup('supervisor_professor'),
      {
        title: 'پیکربندی ظرفیت‌ها',
        path: RouteService.karvita.organizationalCapacities(),
        icon: 'fa-chart-pie',
      },
      MANAGE_ANNOUNCEMENTS_ITEM,
    ],
    permissions: [
      'dashboard.view',
      'daily-approval.review',
      'capacity.configure',
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
      orgReportsSidebarGroup('mentor_teacher'),
      MANAGE_ANNOUNCEMENTS_ITEM,
    ],
    permissions: ['dashboard.view', 'daily-approval.review'],
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
        title: 'ارزیابی گزارش‌های فراگیران',
        path: RouteService.karvita.dailyApprovals(),
        icon: 'fa-clipboard-check',
      },
      orgReportsSidebarGroup('school_principal'),
      {
        title: 'مدیریت کارورزان',
        path: PlannedRoutes.traineesManagement(),
        icon: 'fa-id-card',
      },
      {
        title: 'ثبت‌نام مهارت‌آموزان',
        path: PlannedRoutes.studentsList(),
        icon: 'fa-user-group',
      },
      MANAGE_ANNOUNCEMENTS_ITEM,
    ],
    permissions: [
      'dashboard.view',
      'daily-approval.review',
      'trainee.manage',
      'student.manage',
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
        path: PlannedRoutes.locations(),
        icon: 'fa-map',
      },
      ...orgReportsSidebarEntries('regional_edu_admin'),
      MANAGE_ANNOUNCEMENTS_ITEM,
    ],
    permissions: ['dashboard.view', 'location.manage'],
  },

  faculty_role: {
    label: 'مدیر دانشکده',
    badge: 'مدیریت پردیس تابعه',
    roleIcon: 'fa-university',
    layoutWidthClass: 'max-w-none',
    gateModulesUntilApproved: true,
    sidebarMenu: [
      DASHBOARD_ITEM,
      orgReportsSidebarGroup('faculty_role'),
      MANAGE_ANNOUNCEMENTS_ITEM,
    ],
    permissions: ['dashboard.view', 'ads.manage'],
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
        path: PlannedRoutes.locations(),
        icon: 'fa-map',
      },
      ...orgReportsSidebarEntries('provincial_university'),
      MANAGE_ANNOUNCEMENTS_ITEM,
    ],
    permissions: [
      'dashboard.view',
      'location.manage',
      'ads.manage',
    ],
  },

  assistant_admin: {
    label: 'دستیار مدیر ارشد',
    badge: 'معاونت اجرایی و ستادی',
    roleIcon: 'fa-user-gear',
    layoutWidthClass: 'max-w-none',
    gateModulesUntilApproved: false,
    sidebarMenu: omitSidebarPaths(SENIOR_ADMIN_SIDEBAR_MENU, [
      RouteService.karvita.adminUserCreation(),
      RouteService.karvita.reportAccess(),
      RouteService.karvita.reports('learners'),
      RouteService.karvita.syllabusTermSettings(),
      RouteService.karvita.syllabusCourseCatalog(),
    ]),
    permissions: SENIOR_ADMIN_PERMISSIONS.filter(
      (permission) =>
        permission !== 'user.create' && permission !== 'syllabus.term-settings'
    ),
  },

  central_organization: {
    label: 'سازمان مرکزی',
    badge: 'مدیریت کلان کشوری',
    roleIcon: 'fa-building-columns',
    layoutWidthClass: 'max-w-none',
    gateModulesUntilApproved: true,
    sidebarMenu: [
      DASHBOARD_ITEM,
      ...orgReportsSidebarEntries('central_organization'),
      MANAGE_ANNOUNCEMENTS_ITEM,
    ],
    permissions: ['dashboard.view', 'ads.manage'],
  },

  super_admin: {
    label: 'مدیر ارشد',
    badge: 'مدیریت عالی و حاکمیتی',
    roleIcon: 'fa-user-shield',
    layoutWidthClass: 'max-w-none',
    gateModulesUntilApproved: false,
    sidebarMenu: SENIOR_ADMIN_SIDEBAR_MENU,
    permissions: [...SENIOR_ADMIN_PERMISSIONS],
  },
};
