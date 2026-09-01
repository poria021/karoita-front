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
  level: 1 | 2 | 3 | 4;
  /** ارقام ASCII؛ `null` = نامحدود (نقش‌های غیر استاد راهنما در مرجع). */
  total: number | null;
  confirmed: number;
  /** استاد راهنما: حداکثر یک روز. */
  selectedDays: OrganizationalCapacityWeekday[];
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

export type GetOrganizationalCapacitiesInput = {
  kind: OrganizationalCapacityKind;
  termId: string;
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
  }>;
};
