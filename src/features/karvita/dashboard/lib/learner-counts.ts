import type { DailyApprovalTrainee } from '@/types/daily-approvals';

/**
 * شمار فراگیران میز کار استاد راهنما / معلم راهنما / مدیر مدرسه.
 * فقط فراگیران فعال شمرده می‌شوند (حذف‌شده‌ها نه).
 */
export type LearnerCountsSummary = {
  /** دانشجویان — فراگیران فعال کارورزی (ترمی). */
  students: number;
  /** مهارت‌آموزان — فراگیران فعال کارآموزی (پودمانی). */
  skillLearners: number;
  /** معلمان یکتایی که دست‌کم یک فراگیر فعال دارند (برای مدیر مدرسه). */
  teachers: number;
  /** فهرست پیش از رسیدن به آخرین صفحه قطع شده؛ اعداد «دست‌کم» هستند. */
  truncated: boolean;
};

export function buildLearnerCounts(
  trainees: readonly DailyApprovalTrainee[],
  truncated = false
): LearnerCountsSummary {
  let students = 0;
  let skillLearners = 0;
  const teacherIds = new Set<string>();

  for (const trainee of trainees) {
    if (trainee.status !== 'active') continue;

    if (trainee.kind === 'internship') students += 1;
    else if (trainee.kind === 'apprenticeship') skillLearners += 1;

    const teacherId = trainee.teacherId?.trim();
    if (teacherId) teacherIds.add(teacherId);
  }

  return { students, skillLearners, teachers: teacherIds.size, truncated };
}
