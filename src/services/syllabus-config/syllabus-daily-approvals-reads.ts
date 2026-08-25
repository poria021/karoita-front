import { readSyllabusSnapshot } from '@/services/syllabus-config/mock/mock-syllabus-store';
import type { DailyApprovalCourseKind } from '@/types/daily-approvals';
import type { AcademicTermType } from '@/types/syllabus-config';

const DEFAULT_PASSING_SCORE = 70;

function termTypeForKind(kind: DailyApprovalCourseKind): AcademicTermType {
  return kind === 'apprenticeship' ? 'modular' : 'semester';
}

/** internship → semester terms; apprenticeship → modular */
export function listTermsForDailyApprovalKind(
  kind: DailyApprovalCourseKind
): Array<{ id: string; title: string }> {
  const preferredType = termTypeForKind(kind);
  return readSyllabusSnapshot()
    .terms.filter((term) => term.type === preferredType)
    .map((term) => ({ id: term.id, title: term.title }));
}

export function readDailyApprovalPassingScoreThreshold(): number {
  const value = readSyllabusSnapshot().passingScoreThreshold;
  return Number.isFinite(value) ? value : DEFAULT_PASSING_SCORE;
}
