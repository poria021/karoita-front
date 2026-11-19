import type { DailyApprovalTrainee } from '@/types/daily-approvals';

export type StudentGradeRankingItem = {
  id: string;
  traineeName: string;
  courseTitle: string;
  /** کلید درس (`?course=`) برای باز کردن لیست همان درس. */
  courseKey: string;
  kind: DailyApprovalTrainee['kind'];
  grade: number;
};

export type StudentGradeRankingSummary = {
  weakest: StudentGradeRankingItem[];
  strongest: StudentGradeRankingItem[];
};

const TOP_N = 6;

function toRankingItem(trainee: DailyApprovalTrainee): StudentGradeRankingItem {
  return {
    id: trainee.id,
    traineeName: trainee.traineeName,
    courseTitle: trainee.courseTitle,
    courseKey: trainee.courseKey,
    kind: trainee.kind,
    grade: trainee.progressiveGrade.final20 as number,
  };
}

/**
 * ۶ فراگیرِ ضعیف‌ترین و ۶ فراگیرِ قوی‌ترین بر اساس نمرهٔ نهایی (از ۲۰) درسِ
 * خودشان — فقط فراگیرانی که نمرهٔ نهایی گرفته‌اند (درحال‌انجام/بدون نمره حذف می‌شوند).
 */
export function buildStudentGradeRanking(
  trainees: readonly DailyApprovalTrainee[]
): StudentGradeRankingSummary {
  const graded = trainees
    .filter((trainee) => trainee.progressiveGrade.final20 != null)
    .map(toRankingItem);

  const weakest = [...graded].sort((a, b) => a.grade - b.grade).slice(0, TOP_N);
  const strongest = [...graded]
    .sort((a, b) => b.grade - a.grade)
    .slice(0, TOP_N);

  return { weakest, strongest };
}
