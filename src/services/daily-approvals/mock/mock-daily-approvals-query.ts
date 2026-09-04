import { toDailyApprovalCatalogCourses, toDailyApprovalWeekOptions } from '@/services/daily-approvals/daily-approval-catalog-mappers';
import {
  readTrainees,
} from '@/services/daily-approvals/mock/mock-daily-approvals-persistence';
import { listTermsForDailyApprovalKind } from '@/services/syllabus-config/mock/mock-syllabus-daily-approvals-reads';
import type {
  DailyApprovalCatalogCourse,
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalReadFilter,
  DailyApprovalTrainee,
  DailyApprovalWeekOption,
  ListDailyApprovalsInput,
  ListDailyApprovalsPage,
} from '@/types/daily-approvals';
import { sliceOffsetLimitPage } from '@/utils/offset-limit-page';
import { persianToEnglishDigits } from '@/utils/persianDigits';

export { listTermsForDailyApprovalKind };

const MOCK_INTERNSHIP_COURSES = [
  { id: 'intern1', title: 'کارورزی ۱' },
  { id: 'intern2', title: 'کارورزی ۲' },
  { id: 'intern3', title: 'کارورزی ۳' },
  { id: 'intern4', title: 'کارورزی ۴' },
];

const MOCK_APPRENTICESHIP_COURSES = [
  { id: 'appr1', title: 'کارآموزی ۱' },
  { id: 'appr2', title: 'کارآموزی ۲' },
];

export function listMockDailyApprovalCourses(
  kind: DailyApprovalCourseKind
): DailyApprovalCatalogCourse[] {
  return toDailyApprovalCatalogCourses(
    kind,
    kind === 'internship' ? MOCK_INTERNSHIP_COURSES : MOCK_APPRENTICESHIP_COURSES
  );
}

export function listMockDailyApprovalWeeks(
  kind: DailyApprovalCourseKind,
  courseFilter: Exclude<DailyApprovalCourseFilter, 'all'>
): DailyApprovalWeekOption[] {
  const trainee = readTrainees().find(
    (row) => row.kind === kind && row.courseKey === courseFilter
  );
  const count =
    trainee?.weeks.length ?? (kind === 'internship' ? 16 : 8);
  return toDailyApprovalWeekOptions(
    Array.from({ length: count }, (_, index) => ({
      title: `هفته ${index + 1}`,
    }))
  );
}

function matchesQuery(trainee: DailyApprovalTrainee, rawQuery: string): boolean {
  const query = persianToEnglishDigits(rawQuery).trim().toLocaleLowerCase('fa');
  if (!query) return true;
  const haystack = persianToEnglishDigits(
    [trainee.traineeName, trainee.identifier, trainee.courseTitle, trainee.major]
      .join(' ')
      .toLocaleLowerCase('fa')
  );
  return haystack.includes(query);
}

function matchesReadFilter(
  trainee: DailyApprovalTrainee,
  readFilter: DailyApprovalReadFilter
): boolean {
  if (readFilter === 'all') return true;
  if (readFilter === 'dropped') return trainee.status === 'dropped';
  if (trainee.status === 'dropped') return false;
  if (readFilter === 'unread') return trainee.unreadCount > 0;
  return trainee.hasSubmitted && trainee.unreadCount === 0;
}

export function matchesCourse(
  trainee: DailyApprovalTrainee,
  course: DailyApprovalCourseFilter
): boolean {
  if (course === 'all') return true;
  return trainee.courseKey === course;
}

export function listMockDailyApprovals(
  input: ListDailyApprovalsInput
): ListDailyApprovalsPage {
  const filtered = readTrainees()
    .filter((trainee) => trainee.kind === input.kind)
    .filter((trainee) => trainee.termId === input.termId || !input.termId)
    .filter((trainee) => matchesQuery(trainee, input.query))
    .filter((trainee) => matchesReadFilter(trainee, input.readFilter))
    .filter((trainee) => matchesCourse(trainee, input.course))
    .sort((left, right) => {
      if (left.status === 'dropped' && right.status !== 'dropped') return 1;
      if (right.status === 'dropped' && left.status !== 'dropped') return -1;
      return right.unreadCount - left.unreadCount;
    });

  return {
    ...structuredClone(
      sliceOffsetLimitPage(filtered, input.offset, input.limit)
    ),
    terms: listTermsForDailyApprovalKind(input.kind),
  };
}
