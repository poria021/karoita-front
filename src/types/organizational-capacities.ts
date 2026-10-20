import type { NestSemesterWithLessons } from '@/types/nest-admin';

export type OrganizationalCapacityKind = 'internship' | 'apprenticeship';

export type OrganizationalCapacitySubmissionStatus =
  | 'draft'
  | 'pending_admin'
  | 'approved'
  | 'rejected';

/** کلید روز هفته انگلیسی در فرم/API؛ برچسب UI فارسی است. */
export type OrganizationalCapacityWeekday =
  | 'sat'
  | 'sun'
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu';

export type OrganizationalCapacityCourse = {
  id: string;
  title: string;
  kind: OrganizationalCapacityKind;
  /** فقط از عنوان درس واقعی Nest پارس می‌شود؛ درس داینامیک mock سطح ندارد. */
  level?: number;
  /** زیرمجموعهٔ یک درس؛ درس مستقل این دو را ندارد. */
  groupId?: string;
  groupTitle?: string;
  /** ارقام ASCII؛ `null` = نامحدود (نقش‌های غیر استاد راهنما در مرجع). */
  total: number | null;
  confirmed: number;
  /** استاد راهنما: حداکثر یک روز. */
  selectedDays: OrganizationalCapacityWeekday[];
  /** درس فعال برای ارائه در این ترم؛ `false` = فقط نمایش، بدون ویرایش. */
  isActive?: boolean;
  /** ردیف Nest از قبل وجود دارد → ذخیره با PUT نه POST. */
  existsOnServer?: boolean;
};

export type OrganizationalCapacitiesSnapshot = {
  termId: string;
  termTitle: string;
  kind: OrganizationalCapacityKind;
  maxCapacity: number;
  status: OrganizationalCapacitySubmissionStatus;
  courses: OrganizationalCapacityCourse[];
  summary: {
    total: number | 'unlimited';
    confirmed: number;
    remaining: number | 'unlimited';
  };
  terms: Array<{ id: string; title: string }>;
};

/**
 * کاتالوگ ترم‌ها — یک‌بار لود و در react-query cache می‌شود.
 * real: `semesters_all` + `settings`؛ mock فقط `terms`.
 */
export type OrganizationalCapacityCatalog = {
  terms: Array<{ id: string; title: string }>;
  bundles?: NestSemesterWithLessons[];
  maxCapacity?: number;
};

export type GetOrganizationalCapacitiesInput = {
  kind: OrganizationalCapacityKind;
  termId: string;
  /** اگر داده شود، فقط GET ظرفیت‌ها زده می‌شود (نه semesters_all/settings). */
  catalog?: OrganizationalCapacityCatalog;
};

export type UpdateOrganizationalCapacityCourseInput = {
  kind: OrganizationalCapacityKind;
  termId: string;
  courseId: string;
  total: number | null;
  selectedDays: OrganizationalCapacityWeekday[];
};

export type SubmitOrganizationalCapacitiesInput = {
  kind: OrganizationalCapacityKind;
  termId: string;
  courses: Array<{
    courseId: string;
    total: number | null;
    selectedDays: OrganizationalCapacityWeekday[];
    /** از snapshot کلاینت؛ اگر نباشد، real یک GET برای تشخیص POST/PUT می‌زند. */
    existsOnServer?: boolean;
  }>;
  /** از snapshot کلاینت. */
  maxCapacity?: number;
  /** کاتالوگ cache‌شده؛ اگر نباشد، real خودش یک‌بار می‌خواند. */
  catalog?: OrganizationalCapacityCatalog;
};
