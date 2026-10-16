import type {
  DailyApprovalCatalogCourse,
  DailyApprovalCompetencyRating,
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalReadFilter,
  DailyApprovalWeekState,
} from '@/types/daily-approvals';
import { evaluationCourseFilterId } from '@/services/syllabus-config/course-catalog';
import type { CourseDefinition } from '@/types/syllabus-config';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

/** حدنصاب قبولی گزارش روی مقیاس ۰–۱۰۰ (مرجع mock). */
export const DAILY_APPROVAL_PASSING_SCORE = 70;

/** تمدید گروهی هفته هنوز به API واقعی وصل نشده — فعلاً پشت این فلگ خاموش است. */
export const DAILY_APPROVALS_BULK_EXTEND_ENABLED = false;

/** رونوشت chrome ماژول ارزیابی گزارش‌ها. */
export const DAILY_APPROVALS_FEATURE = {
  title: 'ارزیابی و ممیزی نهایی گزارش‌ها',
  description:
    'بررسی، نمره‌دهی و تأیید نهایی گزارش‌های هفتگی کارورزان و کارآموزان در این بخش انجام می‌شود.',
} as const;

/** تعداد هفته‌های قابل تمدید گروهی — کارورزی ۱۶، کارآموزی ۸. */
export const DAILY_APPROVAL_WEEK_COUNT: Record<
  DailyApprovalCourseKind,
  number
> = {
  internship: 16,
  apprenticeship: 8,
};

export function getDailyApprovalWeekOptions(kind: DailyApprovalCourseKind) {
  const count = DAILY_APPROVAL_WEEK_COUNT[kind];
  return Array.from({ length: count }, (_, index) => {
    const weekNumber = index + 1;
    return {
      value: String(weekNumber),
      label: `هفته ${toPersianDigits(weekNumber)}`,
      weekNumber,
    };
  });
}

export const DAILY_APPROVAL_COMPETENCY_OPTIONS: readonly {
  value: DailyApprovalCompetencyRating;
  label: string;
}[] = [
  { value: '5', label: `${toPersianDigits(5)} - بسیار عالی` },
  { value: '4', label: `${toPersianDigits(4)} - خیلی خوب` },
  { value: '3', label: `${toPersianDigits(3)} - خوب` },
  { value: '2', label: `${toPersianDigits(2)} - متوسط` },
  { value: '1', label: `${toPersianDigits(1)} - ضعیف` },
];

export function competencyRatingLabel(
  rating: DailyApprovalCompetencyRating | undefined
): string {
  if (!rating) return '';
  return (
    DAILY_APPROVAL_COMPETENCY_OPTIONS.find((option) => option.value === rating)
      ?.label ?? toPersianDigits(rating)
  );
}

export const DAILY_APPROVAL_READ_FILTER_OPTIONS: readonly {
  value: Exclude<DailyApprovalReadFilter, 'dropped'>;
  label: string;
  mobileLabel: string;
}[] = [
  { value: 'all', label: 'همه گزارش‌ها', mobileLabel: 'همه گزارش‌ها' },
  { value: 'read', label: 'خوانده شده', mobileLabel: 'خوانده شده' },
  { value: 'unread', label: 'خوانده نشده', mobileLabel: 'خوانده نشده' },
];

const INTERNSHIP_COURSES: readonly {
  value: DailyApprovalCourseFilter;
  label: string;
}[] = [
  { value: 'all', label: 'همه دروس' },
  { value: 'intern1', label: 'کارورزی ۱' },
  { value: 'intern2', label: 'کارورزی ۲' },
  { value: 'intern3', label: 'کارورزی ۳' },
  { value: 'intern4', label: 'کارورزی ۴' },
];

const APPRENTICESHIP_COURSES: readonly {
  value: DailyApprovalCourseFilter;
  label: string;
}[] = [
  { value: 'all', label: 'همه دروس' },
  { value: 'appr1', label: 'کارآموزی ۱' },
  { value: 'appr2', label: 'کارآموزی ۲' },
];

export type DailyApprovalCourseOption = {
  value: DailyApprovalCourseFilter;
  label: string;
};

/** شناسهٔ ماژول‌های قابل ارزیابی یک درس: زیرمجموعه‌ها، یا خود درس اگر زیرمجموعه ندارد. */
export function evaluationScopeKeys(courseModule: CourseDefinition): string[] {
  const leafIds =
    courseModule.subModules.length > 0
      ? courseModule.subModules.map((sub) => sub.id)
      : [courseModule.id];
  return leafIds.map(evaluationCourseFilterId);
}

/**
 * فیلتر بالای جدول — فقط mock (در real ببین `getRealDailyApprovalCourseOptions`).
 * با درس داینامیک فقط زیرمجموعه‌های همان درس می‌آید؛ بدون آن فهرست ثابت قبلی. مقدار گزینه از `evaluationCourseFilterId` می‌آید تا
 * داده‌ی mock قدیمی (`intern1`) فیلتر شود.
 */
export function getDailyApprovalCourseOptions(
  kind: DailyApprovalCourseKind,
  courseModule: CourseDefinition | null = null
): readonly DailyApprovalCourseOption[] {
  if (!courseModule) {
    return kind === 'internship' ? INTERNSHIP_COURSES : APPRENTICESHIP_COURSES;
  }
  if (courseModule.subModules.length === 0) {
    return [{ value: 'all', label: toPersianDigits(courseModule.title) }];
  }
  return [
    { value: 'all', label: 'همه زیرمجموعه‌ها' },
    ...courseModule.subModules.map((sub) => ({
      value: evaluationCourseFilterId(sub.id),
      label: toPersianDigits(sub.title),
    })),
  ];
}

/**
 * فیلتر درس حالت real: «همه» + یک گزینه برای هر lesson همان ترم (مقدار = `lessonId`).
 * درس تازه‌ای که مدیر ارشد بسازد بدون تغییر کد در فیلتر می‌آید.
 */
export function getRealDailyApprovalCourseOptions(
  courses: readonly DailyApprovalCatalogCourse[]
): readonly DailyApprovalCourseOption[] {
  return [
    { value: 'all', label: 'همه دروس' },
    ...courses.map((course) => ({
      value: course.courseFilter,
      label: toPersianDigits(course.title),
    })),
  ];
}

/** هم‌تراز با `SESSION_VISUALS` انتخاب واحد (پنل گزارش‌نویسی). */
export type WeekVisual = {
  label: string;
  legendLabel?: string;
  className: string;
  hoverClassName: string;
  icon: (typeof faIcons)[keyof typeof faIcons];
};

export function getWeekVisual(status: DailyApprovalWeekState): WeekVisual {
  switch (status) {
    case 'locked_future':
      return {
        label: 'قفل',
        legendLabel: 'قفل',
        className:
          'border-kv-border bg-kv-surface-muted text-kv-text-faint shadow-none opacity-70',
        hoverClassName:
          'cursor-not-allowed enabled:hover:bg-inherit enabled:hover:text-inherit',
        icon: faIcons.lock,
      };
    case 'overdue':
      return {
        label: 'منقضی شده',
        legendLabel: 'منقضی شده',
        className:
          'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg',
        hoverClassName:
          'enabled:hover:bg-kv-danger-soft-hover enabled:hover:text-kv-danger-soft-fg',
        icon: faIcons.clockRotateLeft,
      };
    case 'extended':
      return {
        label: 'تمدید',
        legendLabel: 'تمدید',
        className:
          'border-kv-violet-border bg-kv-violet-soft text-kv-violet-soft-fg',
        hoverClassName:
          'enabled:hover:bg-kv-violet-soft-hover enabled:hover:text-kv-violet-soft-fg',
        icon: faIcons.unlockKeyhole,
      };
    case 'draft':
      return {
        label: 'پیش‌نویس',
        legendLabel: 'پیش‌نویس',
        className:
          'border-kv-neutral-border bg-kv-neutral-soft text-kv-neutral-soft-fg',
        hoverClassName:
          'enabled:hover:bg-kv-neutral-soft-hover enabled:hover:text-kv-neutral-soft-fg',
        icon: faIcons.clipboardList,
      };
    case 'pending':
      return {
        label: 'ارسال شده',
        legendLabel: 'ارسال شده',
        className:
          'border-kv-info-border bg-kv-info-soft text-kv-info-soft-fg',
        hoverClassName:
          'enabled:hover:bg-kv-info-soft-hover enabled:hover:text-kv-info-soft-fg',
        icon: faIcons.clock,
      };
    case 'needs_edit':
      return {
        label: 'نیازمند ویرایش',
        legendLabel: 'نیازمند ویرایش',
        className:
          'border-kv-warning-border bg-kv-warning-soft text-kv-warning-soft-fg',
        hoverClassName:
          'enabled:hover:bg-kv-warning-soft-hover enabled:hover:text-kv-warning-soft-fg',
        icon: faIcons.triangleExclamation,
      };
    case 'approved':
      return {
        label: 'تایید معلم',
        legendLabel: 'تایید معلم',
        className:
          'border-kv-success-border bg-kv-success-soft text-kv-success-soft-fg',
        hoverClassName:
          'enabled:hover:bg-kv-success-soft-hover enabled:hover:text-kv-success-soft-fg',
        icon: faIcons.check,
      };
    case 'graded':
      return {
        label: 'نمره نهایی',
        legendLabel: 'نمره نهایی',
        className: 'border-kv-success-border bg-kv-success text-kv-success-fg',
        hoverClassName:
          'enabled:hover:bg-kv-success-hover enabled:hover:text-kv-success-fg',
        icon: faIcons.circleCheck,
      };
    case 'archived':
      return {
        label: 'بایگانی شده',
        className: 'border-kv-border bg-kv-surface-muted text-kv-text-faint',
        hoverClassName: 'enabled:hover:bg-inherit enabled:hover:text-inherit',
        icon: faIcons.folderOpen,
      };
    case 'locked_dropped':
      return {
        label: 'حذف',
        className:
          'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg opacity-55',
        hoverClassName: 'enabled:hover:bg-inherit enabled:hover:text-inherit',
        icon: faIcons.lock,
      };
    default:
      return {
        label: 'پیش‌نویس',
        legendLabel: 'پیش‌نویس',
        className:
          'border-kv-neutral-border bg-kv-neutral-soft text-kv-neutral-soft-fg',
        hoverClassName:
          'enabled:hover:bg-kv-neutral-soft-hover enabled:hover:text-kv-neutral-soft-fg',
        icon: faIcons.clipboardList,
      };
  }
}

/** همان مجموعه و ترتیب وضعیت افسانهٔ هفته در انتخاب واحد. */
export const WEEK_LEGEND_ITEMS: readonly {
  label: string;
  icon: (typeof faIcons)[keyof typeof faIcons];
  wellClass: string;
}[] = (
  [
    'locked_future',
    // 'overdue', // بج «منقضی شده» فعلاً در راهنمای وضعیت نمایش داده نمی‌شود.
    // 'extended', // تمدید گروهی هفته فعلاً غیرفعال است — در UI نمایش داده نمی‌شود.
    'draft',
    'pending',
    'needs_edit',
    'approved',
    'graded',
  ] as const
).map((status) => {
  const visual = getWeekVisual(status);
  return {
    label: visual.legendLabel ?? visual.label,
    icon: visual.icon,
    wellClass: visual.className,
  };
});
