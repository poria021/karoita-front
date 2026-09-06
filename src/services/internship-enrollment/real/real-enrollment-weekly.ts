/**
 * گزارش هفتگی دانشجو — real mode.
 * جریان ذخیره: start → addSubmission.
 * جریان ارسال: start → addSubmission → submit.
 * backend پاسخ بدون بدنه می‌دهد؛ نتیجه optimistic از ورودی ساخته می‌شود.
 */
import { requireNestTransport } from '@/services/require-nest-transport';
import { studentWeeksApi } from '@/services/internship-enrollment/real/student-weeks.api';
import type {
  InternshipWeeklySession,
  SaveWeeklyReportDraftInput,
  SubmitWeeklyReportInput,
} from '@/types/internship-enrollment';

function buildOptimisticWeekSession(
  input: SaveWeeklyReportDraftInput,
  status: InternshipWeeklySession['status']
): InternshipWeeklySession {
  return {
    id: input.weekId,
    title: '',
    status,
    score: null,
    text: input.text,
    files: input.files,
  };
}

export async function realSaveWeeklyReportDraft(
  input: SaveWeeklyReportDraftInput
): Promise<InternshipWeeklySession> {
  requireNestTransport('InternshipEnrollmentService.saveWeeklyReportDraft');
  await studentWeeksApi.start(input.weekId);
  await studentWeeksApi.addSubmission(input.weekId, {
    text: input.text || undefined,
    fileIds: input.files.map((f) => f.id),
  });
  return buildOptimisticWeekSession(input, 'draft');
}

export async function realSubmitWeeklyReport(
  input: SubmitWeeklyReportInput
): Promise<InternshipWeeklySession> {
  requireNestTransport('InternshipEnrollmentService.submitWeeklyReport');
  await studentWeeksApi.start(input.weekId);
  await studentWeeksApi.addSubmission(input.weekId, {
    text: input.text || undefined,
    fileIds: input.files.map((f) => f.id),
  });
  await studentWeeksApi.submit(input.weekId);
  return buildOptimisticWeekSession(input, 'pending');
}
