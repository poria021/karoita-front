import type { DailyApprovalTrainee } from '@/types/daily-approvals';

export type StudentGradeListItem = {
  id: string;
  traineeName: string;
  courseTitle: string;
  kind: DailyApprovalTrainee['kind'];
  /** نمرهٔ نهایی از ۲۰؛ null = هنوز نمرهٔ نهایی ندارد. */
  grade: number | null;
};

function compareNames(a: string, b: string): number {
  return a.localeCompare(b, 'fa');
}

/**
 * نمرهٔ نهایی (از ۲۰) همهٔ فراگیران استاد راهنما — برای کارت «نمرات فراگیران».
 * اول کسانی که نمره دارند (از زیاد به کم؛ هم‌نمره: ترتیب نام فارسی)،
 * بعد فراگیرانِ بدون نمرهٔ نهایی (به ترتیب نام).
 */
export function buildStudentGradesList(
  trainees: readonly DailyApprovalTrainee[]
): StudentGradeListItem[] {
  const items = trainees.map<StudentGradeListItem>((trainee) => {
    const final20 = trainee.progressiveGrade.final20;
    return {
      id: trainee.id,
      traineeName: trainee.traineeName,
      courseTitle: trainee.courseTitle,
      kind: trainee.kind,
      grade: typeof final20 === 'number' && Number.isFinite(final20) ? final20 : null,
    };
  });

  return items.sort((a, b) => {
    if (a.grade === null && b.grade === null) {
      return compareNames(a.traineeName, b.traineeName);
    }
    if (a.grade === null) return 1;
    if (b.grade === null) return -1;
    if (a.grade !== b.grade) return b.grade - a.grade;
    return compareNames(a.traineeName, b.traineeName);
  });
}
