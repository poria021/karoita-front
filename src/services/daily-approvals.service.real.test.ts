import { afterEach, describe, expect, it, vi } from 'vitest';

import { DailyApprovalsService } from '@/services/daily-approvals.service';
import {
  listRealCapacityCourses,
  listRealCapacityTerms,
} from '@/services/organizational-capacities/real/real-organizational-capacities';
import { getRealWeeksForLesson } from '@/services/syllabus-config/real/real-syllabus-reads';
import { studentWeeksApi } from '@/services/internship-enrollment/real/student-weeks.api';
import { conversationsApi } from '@/services/conversations/real/conversations.api';
import { findWeekConversationId } from '@/services/daily-approvals/real/real-daily-approvals-conversations';

vi.mock('@/services/internship-enrollment/real/student-weeks.api', () => ({
  studentWeeksApi: {
    score: vi.fn(async () => undefined),
  },
}));

vi.mock('@/services/conversations/real/conversations.api', () => ({
  conversationsApi: {
    postMessage: vi.fn(async () => undefined),
  },
}));

vi.mock('@/services/daily-approvals/real/real-daily-approvals-conversations', () => ({
  findWeekConversationId: vi.fn(async () => 'conv-1'),
}));

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

  it('scores a week via PATCH student-weeks/{id}/score in real mode', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    vi.mocked(studentWeeksApi.score).mockClear();

    await DailyApprovalsService.updateWeekEvaluation({
      traineeId: 't1',
      weekId: 'w1',
      score: 87.5,
      advisorFeedback: 'متن بازخورد که هنوز جایی برای ذخیره ندارد',
    });

    expect(studentWeeksApi.score).toHaveBeenCalledWith('w1', 87.5);
  });

  it('rejects a report without a score by posting the advisor feedback to the week conversation', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    vi.mocked(studentWeeksApi.score).mockClear();
    vi.mocked(conversationsApi.postMessage).mockClear();

    await DailyApprovalsService.updateWeekEvaluation({
      traineeId: 't1',
      weekId: 'w1',
      score: null,
      advisorFeedback: 'فقط بازخورد، بدون نمره',
    });

    expect(studentWeeksApi.score).not.toHaveBeenCalled();
    expect(findWeekConversationId).toHaveBeenCalledWith('t1', 'w1');
    expect(conversationsApi.postMessage).toHaveBeenCalledWith('conv-1', {
      text: 'فقط بازخورد، بدون نمره',
    });
  });

  it('rejects an empty advisor feedback with no score instead of silently posting nothing', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    vi.mocked(conversationsApi.postMessage).mockClear();

    await expect(
      DailyApprovalsService.updateWeekEvaluation({
        traineeId: 't1',
        weekId: 'w1',
        score: null,
        advisorFeedback: '   ',
      })
    ).rejects.toThrow(/بازخورد متنی الزامی است/);
    expect(conversationsApi.postMessage).not.toHaveBeenCalled();
  });
});
