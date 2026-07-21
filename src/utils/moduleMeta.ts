import { RouteService } from '@/services/route.service';
import type { UserRole } from '@/types/auth';


export interface ModuleMeta {
  title: string;
  description: string;
  icon: string;
  showSemester?: boolean;
}

const FALLBACK_META: ModuleMeta = {
  title: 'پورتال جامع کارویتا',
  description: 'سامانه جامع آموزش نظری و مهارتی کارویتا.',
  icon: 'fa-folder-open',
};

const PROFILE_META: ModuleMeta = {
  title: 'پروفایل و اسناد هویتی',
  description:
    'مدیریت اطلاعات پرسنلی، احراز هویت، بارگذاری مستندات و تنظیم رمز عبور حساب.',
  icon: 'fa-file-shield',
  showSemester: false,
};

const MODULE_META_BY_PATH: Record<string, ModuleMeta> = {
  [RouteService.karvita.dashboard()]: {
    title: 'میز کار',
    description: 'به پرتال آموزشی سامانه کارویتا خوش آمدید.',
    icon: 'fa-home',
  },
  [RouteService.karvita.adminDashboard()]: {
    title: 'میز کار مدیریت ارشد',
    description:
      'پنل حاکمیتی سامانه کارویتا — بررسی مدارک، دسترسی‌ها و پیکربندی سازمانی.',
    icon: 'fa-user-shield',
  },
  [RouteService.karvita.dailyReports()]: {
    title: 'ثبت و ارسال گزارش روزانه',
    description:
      'ورود اطلاعات حضور، شرح اقدامات آموزشی کلاس درس و مستندات عملکرد.',
    icon: 'fa-clipboard-list',
  },
  [RouteService.karvita.dailyApprovals()]: {
    title: 'ارزیابی گزارش‌های فراگیران',
    description:
      'مشاهده گزارش‌های هفتگی ثبت‌شده، ثبت بازخوردهای متنی ناظران و ممیزی نمرات علمی فراگیران در نیم‌سال تحصیلی جاری.',
    icon: 'fa-clipboard-check',
    showSemester: true,
  },
  [RouteService.karvita.traineesManagement()]: {
    title: 'مدیریت کارورزان',
    description: 'صفحه مدیریت و پایش فرآیندهای مدیریت کارورزان.',
    icon: 'fa-id-card',
  },
  [RouteService.karvita.studentsList()]: {
    title: 'ثبت‌نام دانش‌آموزان و مهارت‌آموزان',
    description:
      'افزودن دانشجویان و مهارت‌آموزان جدید، تفکیک بر اساس نوع دوره، ویرایش مشخصات و مدارک ثبت‌نام.',
    icon: 'fa-user-group',
  },
  [RouteService.karvita.standardReports()]: {
    title: 'گزارش‌های استاندارد سیستمی',
    description:
      'گزارش‌گیری متمرکز بر نمرات، ساعات کارگاهی، لاگ‌های سیستمی و وضعیت تکمیل گزارش‌ها.',
    icon: 'fa-file-invoice',
    showSemester: true,
  },
  [RouteService.karvita.comparativeReports()]: {
    title: 'تحلیل مقایسه‌ای عملکرد',
    description:
      'رصد رقابتی و مقایسه عملکرد دانشکده‌ها، اساتید، مدارس و فراگیران بر اساس شاخص‌های آموزشی.',
    icon: 'fa-chart-column',
    showSemester: true,
  },
  [RouteService.karvita.termLifecycle()]: {
    title: 'مدیریت بازه‌ها و چرخه ترم',
    description:
      'تعیین زمان‌بندی دقیق، مهلت‌های انتخاب واحد و فعال‌سازی دستی دسترسی‌ها برای نیم‌سال جاری.',
    icon: 'fa-clock-rotate-left',
  },
  [RouteService.karvita.syllabusCourseOfferings()]: {
    title: 'ارائه و سرفصل دروس',
    description:
      'فعال‌سازی ارائه دروس ترم و ویرایش سرفصل هفتگی هر درس در نیم‌سال جاری.',
    icon: 'fa-sliders',
  },
  [RouteService.karvita.syllabusTermSettings()]: {
    title: 'تنظیمات عمومی ترم‌ها',
    description:
      'تعریف دوره‌های تحصیلی، ظرفیت استاد و آستانه نمره قبولی در سطح سامانه.',
    icon: 'fa-clock-rotate-left',
  },
  [RouteService.karvita.locations()]: {
    title: 'مکان‌ها و مناطق',
    description: 'صفحه مدیریت و پایش فرآیندهای مکان‌ها و مناطق.',
    icon: 'fa-map',
  },
  [RouteService.karvita.onboardingApprovals()]: {
    title: 'بررسی مدارک هویتی ثبت‌نام',
    description:
      'تأیید صلاحیت هویتی و مدارک کارورزان و مربیان جهت فعال‌سازی پنل کاربری.',
    icon: 'fa-id-card',
  },
  [RouteService.karvita.userPermissions()]: {
    title: 'مدیریت دسترسی‌های پویا (RBAC)',
    description:
      'تعریف دامنه‌های سازمانی (Scope)، ارتقای موقت نقش و ویرایش مجوزهای ممیزی کاربران.',
    icon: 'fa-user-gear',
  },
  [RouteService.karvita.manageAds()]: {
    title: 'پنل انتشارات و اعلانات',
    description:
      'بخش مدیریت عالی انتشارات، اعلانات استانی و اخبار رسمی سامانه جامع کارویتا.',
    icon: 'fa-bullhorn',
  },
  [RouteService.karvita.internshipSelection()]: {
    title: 'انتخاب واحد کارورزی / کارآموزی',
    description:
      'انتخاب استاد راهنما علمی، مدرسه تابعه و مربی آموزشی کلاس جهت آغاز دوره رسمی.',
    icon: 'fa-graduation-cap',
  },
  [RouteService.karvita.organizationalCapacities()]: {
    title: 'پیکربندی ظرفیت پذیرش کارورزی و کارآموزی',
    description:
      'تعیین سقف مجاز ظرفیت پذیرش دوره‌های کارورزی و کارآموزی مهارتی به همراه تنظیم روزهای حضور هفتگی ناظران.',
    icon: 'fa-chart-pie',
  },
  [RouteService.karvita.organizationalStructure()]: {
    title: 'ساختار سازمانی',
    description:
      'مدیریت و پیکربندی تقسیمات کشوری، پردیس‌ها، مناطق آموزشی و مدارس تابعه در دیزاین سیستم کارویتا.',
    icon: 'fa-network-wired',
  },
  [RouteService.karvita.adminUserCreation()]: {
    title: 'ایجاد حساب‌های سازمانی',
    description:
      'پنل تعریف دستی حساب‌های ارشد، سازمان‌های مرکزی، پردیس‌ها و دستیاران اجرایی سیستم.',
    icon: 'fa-user-plus',
  },
  [RouteService.karvita.academicEvaluation()]: {
    title: 'ارزیابی علمی',
    description: 'صفحه مدیریت و پایش فرآیندهای ارزیابی علمی.',
    icon: 'fa-clipboard-check',
  },
};

const DASHBOARD_META_BY_ROLE: Partial<Record<UserRole, ModuleMeta>> = {
  student: {
    title: 'میز کار دانشجو',
    description:
      'به پرتال آموزشی خود خوش آمدید. خلاصه وضعیت تحصیلی و دوره‌های کارورزی فعال شما.',
    icon: 'fa-home',
  },
  skill_learner: {
    title: 'میز کار مهارت‌آموز',
    description:
      'به پرتال کارگاهی خود خوش آمدید. خلاصه وضعیت دوره‌های کارآموزی فعال شما.',
    icon: 'fa-id-card-clip',
  },
  supervisor_professor: {
    title: 'پیشخوان استاد راهنما',
    description:
      'بخش اساتید راهنمای علمی. مدیریت ارزیابی‌ها، پروژه‌ها و کیفیت گزارش‌های مهارتی تحلیلی.',
    icon: 'fa-chart-line',
  },
  mentor_teacher: {
    title: 'پیشخوان معلم راهنما',
    description:
      'بخش معلمان راهنمای مدرسه. نظارت بر حضور و غیاب، فعالیت‌های مهارتی و ارزیابی گزارش‌ها.',
    icon: 'fa-gauge-high',
  },
  school_principal: {
    title: 'میز کار مدیریت مدرسه',
    description:
      'بخش مدیریت عالی مدرسه تابعه. رصد کلی کارورزان، معلمان و امور کارگاهی.',
    icon: 'fa-school',
  },
};

const STANDARD_REPORTS_DESC_BY_ROLE: Partial<Record<UserRole, string>> = {
  regional_edu_admin:
    'سامانه نظارت بر عملکرد مدارس تابعه، توزیع ظرفیت‌های آموزشی، پایش معلمان راهنما و آمار کارورزان منطقه.',
  school_principal:
    'گزارش‌گیری متمرکز بر ارزیابی‌های کیفی، نمرات پایانی کارورزان و عملکرد مربیان مدرسه تابعه.',
  supervisor_professor:
    'رصد پیشرفت تحصیلی کارورزان کلاس جاری، نمره‌دهی هفتگی و آمار تکالیف تحویلی.',
};

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

function isProfilePath(path: string): boolean {
  return /^\/karvita\/[^/]+\/profile$/.test(path);
}

export function getModuleMeta(
  pathname: string,
  role?: UserRole | null
): ModuleMeta {
  const path = normalizePath(pathname);

  if (isProfilePath(path)) {
    return PROFILE_META;
  }

  if (path === RouteService.karvita.dashboard()) {
    if (role && DASHBOARD_META_BY_ROLE[role]) {
      return DASHBOARD_META_BY_ROLE[role]!;
    }
    return MODULE_META_BY_PATH[path] ?? FALLBACK_META;
  }

  if (path === RouteService.karvita.standardReports()) {
    const base = MODULE_META_BY_PATH[path] ?? FALLBACK_META;
    if (role && STANDARD_REPORTS_DESC_BY_ROLE[role]) {
      return {
        ...base,
        description: STANDARD_REPORTS_DESC_BY_ROLE[role]!,
      };
    }
    return base;
  }

  const exact = MODULE_META_BY_PATH[path];
  if (exact) return exact;

  const sortedPrefixes = Object.keys(MODULE_META_BY_PATH).sort(
    (a, b) => b.length - a.length
  );
  for (const prefix of sortedPrefixes) {
    if (path.startsWith(`${prefix}/`)) {
      return MODULE_META_BY_PATH[prefix]!;
    }
  }

  return FALLBACK_META;
}
