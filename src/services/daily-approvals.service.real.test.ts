import { afterEach, describe, expect, it, vi } from 'vitest';

import { DailyApprovalsService } from '@/services/daily-approvals.service';
import {
  listRealCapacityCourses,
  listRealCapacityTerms,
} from '@/services/organizational-capacities/real/real-organizational-capacities';
import { getRealWeeksForLesson } from '@/services/syllabus-config/real/real-syllabus-reads';

vi.mock(
  '@/services/organizational-capacities/real/real-organizational-capacities',
  () => ({
    listRealCapacityTerms: vi.fn(async (kind: string) =>
      kind === 'apprenticeship'
        ? [{ id: 'mod-1', title: 'پودمان اول' }]
        : [{ id: 'sem-1', title: 'نیم‌سال اول' }]
    ),
    listRealCapacityCourses: vi.fn(async () => [
      { id: 'l1', title: 'کارورزی ۱' },
      { id: 'l2', title: 'کارورزی ۲' },
    ]),
  })
);

vi.mock('@/services/syllabus-config/real/real-syllabus-reads', () => ({
  getRealWeeksForLesson: vi.fn(async () => ({
    weeks: [
      {
        id: 'w1',
        suffix: 'هفته 1',
        title: 'هفته 1',
        weight: 3,
        status: 'active',
      },
      {
        id: 'w2',
        suffix: 'هفته 2',
        title: 'هفته 2',
        weight: 3,
        status: 'archived',
      },
    ],
    isPublished: true,
    serverAlert: null,
  })),
  getRealAcademicSettings: vi.fn(async () => ({
    globalProfessorCapacity: 30,
    passingScoreThreshold: 70,
  })),
}));

describe('DailyApprovalsService real fail-closed', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('loads terms, courses, and weeks in real mode', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');

    await expect(DailyApprovalsService.listTerms('internship')).resolves.toEqual(
      [{ id: 'sem-1', title: 'نیم‌سال اول' }]
    );
    await expect(
      DailyApprovalsService.listCourses({
        kind: 'internship',
        termId: 'sem-1',
      })
    ).resolves.toEqual([
      { id: 'l1', title: 'کارورزی ۱', courseFilter: 'intern1' },
      { id: 'l2', title: 'کارورزی ۲', courseFilter: 'intern2' },
    ]);
    await expect(
      DailyApprovalsService.listWeeks({
        kind: 'internship',
        termId: 'sem-1',
        lessonId: 'l1',
        courseFilter: 'intern1',
      })
    ).resolves.toEqual([
      { value: '1', label: 'هفته ۱', weekNumber: 1 },
    ]);
    expect(listRealCapacityTerms).toHaveBeenCalledWith('internship');
    expect(listRealCapacityCourses).toHaveBeenCalledWith('internship', 'sem-1');
    expect(getRealWeeksForLesson).toHaveBeenCalledWith('sem-1', 'l1');

    await expect(
      DailyApprovalsService.getPassingScoreThreshold()
    ).resolves.toBe(70);
  });
});
