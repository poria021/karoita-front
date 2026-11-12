import type {
  ReportAccessRoleId,
  ReportSlug,
} from '@/types/report-access';

/** پسوند کلید زیرمجوز مقایسه در ماتریس. */
export const COMPARE_KEY_SUFFIX = '@cmp' as const;

export const COMPARE_MAX = 4;

export const REPORT_ACCESS_ROLES: readonly ReportAccessRoleId[] = [
  'mentor_teacher',
  'supervisor_professor',
  'school_principal',
  'regional_edu_admin',
  'faculty_role',
  'provincial_university',
  'central_organization',
  'assistant_admin',
] as const;

/** سند مصوب: گزارش‌های پیش‌فرض هر نقش (بدون استان؛ استان هنگام ساخت سند پر می‌شود). */
export const APPROVED_ROLE_PAGES: Readonly<
  Record<ReportAccessRoleId, readonly ReportSlug[]>
> = {
  supervisor_professor: [
    'learners',
    'attendance',
    'scores',
    'teachers',
    'principals',
  ],
  mentor_teacher: ['learners'],
  school_principal: ['learners', 'attendance', 'teacher-performance'],
  regional_edu_admin: [
    'learners',
    'teachers',
    'principals',
    'schools',
    'teacher-performance',
    'school-performance',
  ],
  faculty_role: [
    'learners',
    'attendance',
    'professor-attendance',
    'scores',
    'professors',
    'teacher-performance',
    'school-performance',
    'professor-performance',
  ],
  provincial_university: [
    'learners',
    'attendance',
    'professor-attendance',
    'professors',
    'faculties',
    'faculty-performance',
  ],
  central_organization: [
    'learners',
    'attendance',
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
  ],
  assistant_admin: [],
};

/** گزارش‌های اختیاری خارج از سند مصوب که مدیر ارشد می‌تواند اعطا کند. */
export const REPORT_ACCESS_EXTRA: Readonly<
  Record<ReportAccessRoleId, readonly ReportSlug[]>
> = {
  mentor_teacher: ['attendance', 'scores'],
  supervisor_professor: ['schools'],
  school_principal: ['scores', 'teachers'],
  regional_edu_admin: ['attendance', 'scores'],
  faculty_role: ['teachers', 'principals', 'schools'],
  provincial_university: [
    'scores',
    'professor-performance',
    'school-performance',
  ],
  central_organization: ['scores', 'teacher-performance'],
  assistant_admin: [
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
  ],
};

export const REPORT_PAGE_META: Readonly<
  Record<ReportSlug, { title: string; description: string }>
> = {
  learners: {
    title: 'لیست فراگیران',
    description:
      'فهرست فراگیران ترم یا پودمان، با رشته، درس‌ها و استاد و معلم راهنما',
  },
  attendance: {
    title: 'حضور و غیاب فراگیران',
    description: 'درصد جلسات حضور تأییدشده‌ی هر فراگیر',
  },
  'professor-attendance': {
    title: 'حضور و غیاب اساتید راهنما',
    description: 'درصد حضور اساتید راهنما در جلسات نیم‌سال',
  },
  scores: {
    title: 'نمرات فراگیران',
    description:
      'وضعیت قبول یا مردود و ریز نمرات هر درس به تفکیک جلسه',
  },
  teachers: {
    title: 'لیست معلمان',
    description: 'مشخصات معلمان راهنما و تعداد فراگیران هر معلم',
  },
  principals: {
    title: 'لیست مدیران مدارس',
    description: 'کد پرسنلی و تلفن مدیران مدارس',
  },
  professors: {
    title: 'لیست اساتید',
    description: 'اساتید به تفکیک دانشکده، دروس تدریس و تعداد فراگیر',
  },
  schools: {
    title: 'لیست مدارس',
    description: 'مدارس به تفکیک شهر و منطقه، با تعداد معلم و فراگیر',
  },
  'teacher-performance': {
    title: 'عملکرد معلمان',
    description: 'نرخ پاسخ‌دهی معلمان راهنما به گزارش‌ها',
  },
  'school-performance': {
    title: 'عملکرد مدارس',
    description: 'نرخ پاسخ‌دهی و میانگین نمره‌ی فراگیران هر مدرسه',
  },
  'professor-performance': {
    title: 'عملکرد اساتید',
    description:
      'روزهای حضور، نرخ پاسخ‌دهی و میانگین نمره‌ی فراگیران',
  },
  faculties: {
    title: 'لیست دانشکده‌ها',
    description:
      'فهرست دانشکده‌ها به تفکیک استان و شهر، با رئیس و تعداد اساتید و فراگیران',
  },
  provinces: {
    title: 'لیست استان‌ها',
    description:
      'فهرست استان‌ها و دانشگاه‌های استانی، با تعداد دانشکده، استاد و فراگیر',
  },
  'faculty-performance': {
    title: 'عملکرد دانشکده‌ها',
    description:
      'روزهای حضور، نرخ پاسخ‌دهی و میانگین نمره‌ی فراگیران هر دانشکده',
  },
  'province-performance': {
    title: 'عملکرد استان‌ها',
    description:
      'روزهای حضور، نرخ پاسخ‌دهی و میانگین نمره‌ی فراگیران هر استان',
  },
};

export const REPORT_ACCESS_THEMES: readonly {
  id: string;
  title: string;
  slugs: readonly ReportSlug[];
}[] = [
  {
    id: 'lists',
    title: 'گزارش‌های لیستی',
    slugs: [
      'learners',
      'teachers',
      'principals',
      'professors',
      'schools',
      'faculties',
      'provinces',
    ],
  },
  {
    id: 'attendance',
    title: 'حضور و غیاب',
    slugs: ['attendance', 'professor-attendance'],
  },
  {
    id: 'performance',
    title: 'گزارش‌های عملکرد',
    slugs: [
      'scores',
      'teacher-performance',
      'school-performance',
      'professor-performance',
      'faculty-performance',
      'province-performance',
    ],
  },
];

/** گزارش‌هایی که زیرمجوز «امکان مقایسه» دارند. */
export const COMPARE_REPORT_SLUGS: readonly ReportSlug[] = [
  'attendance',
  'professor-attendance',
  'teacher-performance',
  'school-performance',
  'professor-performance',
  'faculty-performance',
  'province-performance',
];

const ALL_REPORT_SLUGS = Object.keys(REPORT_PAGE_META) as ReportSlug[];

function catalogForRole(roleId: ReportAccessRoleId): readonly ReportSlug[] {
  return ALL_REPORT_SLUGS.filter(
    (slug) =>
      APPROVED_ROLE_PAGES[roleId].includes(slug) ||
      REPORT_ACCESS_EXTRA[roleId].includes(slug)
  );
}

/** فهرست گزارش‌های مرتبط با هر نقش (سند + اختیاری)، به ترتیب کاتالوگ. */
export const ROLE_REPORT_CATALOG: Readonly<
  Record<ReportAccessRoleId, readonly ReportSlug[]>
> = {
  mentor_teacher: catalogForRole('mentor_teacher'),
  supervisor_professor: catalogForRole('supervisor_professor'),
  school_principal: catalogForRole('school_principal'),
  regional_edu_admin: catalogForRole('regional_edu_admin'),
  faculty_role: catalogForRole('faculty_role'),
  provincial_university: catalogForRole('provincial_university'),
  central_organization: catalogForRole('central_organization'),
  assistant_admin: catalogForRole('assistant_admin'),
};

export function compareKeyFor(slug: ReportSlug): string {
  return `${slug}${COMPARE_KEY_SUFFIX}`;
}

export function isCompareKey(key: string): boolean {
  return key.endsWith(COMPARE_KEY_SUFFIX);
}

export function reportSlugFromKey(key: string): ReportSlug | null {
  if (isCompareKey(key)) {
    const base = key.slice(0, -COMPARE_KEY_SUFFIX.length);
    return base in REPORT_PAGE_META ? (base as ReportSlug) : null;
  }
  return key in REPORT_PAGE_META ? (key as ReportSlug) : null;
}

export function displayTitleForKey(key: string): string {
  if (isCompareKey(key)) {
    const slug = reportSlugFromKey(key);
    if (!slug) return key;
    return `امکان مقایسه در «${REPORT_PAGE_META[slug].title}»`;
  }
  const slug = reportSlugFromKey(key);
  return slug ? REPORT_PAGE_META[slug].title : key;
}
