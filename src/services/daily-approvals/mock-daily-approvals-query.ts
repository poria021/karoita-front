import {
  readTrainees,
} from '@/services/daily-approvals/mock-daily-approvals-persistence';
import { listTermsForDailyApprovalKind } from '@/services/syllabus-config/syllabus-daily-approvals-reads';
import type {
  DailyApprovalCourseFilter,
  DailyApprovalReadFilter,
  DailyApprovalTrainee,
  ListDailyApprovalsInput,
  ListDailyApprovalsPage,
} from '@/types/daily-approvals';
import { sliceOffsetLimitPage } from '@/utils/offset-limit-page';
import { persianToEnglishDigits } from '@/utils/persianDigits';

export { listTermsForDailyApprovalKind };

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
