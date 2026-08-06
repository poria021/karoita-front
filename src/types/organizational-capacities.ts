export type OrganizationalCapacityKind = 'internship' | 'apprenticeship';

export type OrganizationalCapacitySubmissionStatus =
  | 'draft'
  | 'pending_admin'
  | 'approved'
  | 'rejected';

/** English weekday keys in form/API; labels are Persian in UI. */
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
  /** ASCII digits; null = unlimited (non-supervisor roles in reference). */
  total: number | null;
  confirmed: number;
  /** Supervisor: at most one day. */
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
