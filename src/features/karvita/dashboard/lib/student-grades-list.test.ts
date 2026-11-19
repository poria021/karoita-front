import { describe, expect, it } from 'vitest';

import type { DailyApprovalTrainee } from '@/types/daily-approvals';

import { buildStudentGradesList } from './student-grades-list';

function trainee(
  id: string,
  traineeName: string,
  final20: number | null
): DailyApprovalTrainee {
  return {
    id,
    traineeName,
    courseTitle: 'درس نمونه',
    kind: 'internship',
    progressiveGrade: { final20 },
  } as unknown as DailyApprovalTrainee;
}

describe('buildStudentGradesList', () => {
  it('همهٔ فراگیران را می‌آورد؛ نمره‌دارها از زیاد به کم، بدون‌نمره‌ها آخر', () => {
    const list = buildStudentGradesList([
      trainee('1', 'علی', 12),
      trainee('2', 'سارا', null),
      trainee('3', 'پریا', 18),
      trainee('4', 'امیر', 12),
    ]);
    expect(list.map((item) => item.id)).toEqual(['3', '4', '1', '2']);
    expect(list.map((item) => item.grade)).toEqual([18, 12, 12, null]);
  });

  it('فهرست خالی → خالی', () => {
    expect(buildStudentGradesList([])).toEqual([]);
  });
});
