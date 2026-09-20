import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  listRealDailyApprovals,
  loadRealDailyApprovalWeekDetail,
  refreshRealDailyApprovalTraineeDerived,
} from './real-daily-approvals-reads';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import { loadWeekConversationMessages } from '@/services/daily-approvals/real/real-daily-approvals-conversations';
import { conversationsApi } from '@/services/conversations/real/conversations.api';
import { listRealCapacityCourses } from '@/services/organizational-capacities/real/real-organizational-capacities';
import { getRealAcademicSettings } from '@/services/syllabus-config/real/real-syllabus-reads';

vi.mock('@/services/require-nest-transport', () => ({
  requireNestTransport: vi.fn(),
}));

vi.mock('@/services/organizational-capacities/real/real-organizational-capacities', () => ({
  listRealCapacityCourses: vi.fn(async () => []),
}));

vi.mock('@/services/internship-enrollment/real/student-enrollments.api', () => ({
  studentEnrollmentsApi: {
    listMentorStudents: vi.fn(),
    listWeeks: vi.fn(),
    getScoreSummary: vi.fn(),
  },
}));

vi.mock('@/services/daily-approvals/real/real-daily-approvals-conversations', () => ({
  loadWeekConversationMessages: vi.fn(async () => []),
}));

vi.mock('@/services/conversations/real/conversations.api', () => ({
  conversationsApi: {
    listByEnrollment: vi.fn(async () => []),
  },
}));

vi.mock('@/services/syllabus-config/real/real-syllabus-reads', () => ({
  getRealAcademicSettings: vi.fn(async () => ({
    globalProfessorCapacity: 30,
    passingScoreThreshold: 70,
  })),
}));

const baseInput = {
  kind: 'internship' as const,
  query: '',
  readFilter: 'all' as const,
  course: 'all' as const,
  termId: 'sem-1',
  offset: 0,
  limit: 20,
};

describe('listRealDailyApprovals', () => {
  beforeEach(() => {
    vi.mocked(listRealCapacityCourses).mockReset().mockResolvedValue([]);
    vi.mocked(studentEnrollmentsApi.listMentorStudents).mockReset();
    vi.mocked(studentEnrollmentsApi.listWeeks).mockReset();
    vi.mocked(studentEnrollmentsApi.getScoreSummary).mockReset().mockResolvedValue(null);
    vi.mocked(conversationsApi.listByEnrollment).mockReset().mockResolvedValue([]);
    vi.mocked(getRealAcademicSettings)
      .mockReset()
      .mockResolvedValue({ globalProfessorCapacity: 30, passingScoreThreshold: 70 });
  });

  it('populates each trainee row with their own real weeks', async () => {
    vi.mocked(studentEnrollmentsApi.listMentorStudents).mockResolvedValue({
      data: [
        { id: 'e1', studentId: 's1', status: 'active', student: { firstName: 'سارا', lastName: 'احمدی' } },
        { id: 'e2', studentId: 's2', status: 'active', student: { firstName: 'نادر', lastName: 'رحیمی' } },
      ],
      hasNextPage: false,
    });
    vi.mocked(studentEnrollmentsApi.listWeeks).mockImplementation(async (id: string) =>
      id === 'e1'
        ? [
            { id: 'w1', status: 'completed', mentorStatus: 'send', score: 90 },
            { id: 'w2', status: 'in_progress', score: null },
          ]
        : []
    );

    const page = await listRealDailyApprovals(baseInput);

    expect(page.items).toHaveLength(2);
    expect(studentEnrollmentsApi.listWeeks).toHaveBeenCalledWith('e1');
    expect(studentEnrollmentsApi.listWeeks).toHaveBeenCalledWith('e2');

    const first = page.items.find((t) => t.id === 'e1');
    expect(first?.weeks).toHaveLength(2);
    expect(first?.weeks[0]).toMatchObject({ id: 'w1', weekNumber: 1, status: 'graded', score: 90 });
    expect(first?.weeks[1]).toMatchObject({ id: 'w2', weekNumber: 2, status: 'draft', score: null });

    const second = page.items.find((t) => t.id === 'e2');
    expect(second?.weeks).toEqual([]);
  });

  it('computes progressiveGrade from the backend score-summary, not a client-side average', async () => {
    vi.mocked(studentEnrollmentsApi.listMentorStudents).mockResolvedValue({
      data: [{ id: 'e1', studentId: 's1', status: 'active' }],
      hasNextPage: false,
    });
    vi.mocked(studentEnrollmentsApi.listWeeks).mockResolvedValue([
      { id: 'w1', status: 'completed', mentorStatus: 'send', score: 90, submittedAt: '2026-01-01T00:00:00.000Z' },
      { id: 'w2', status: 'completed', mentorStatus: 'send', score: 80, submittedAt: '2026-01-02T00:00:00.000Z' },
    ]);
    vi.mocked(studentEnrollmentsApi.getScoreSummary).mockResolvedValue({
      totalScore: 170,
      scoredWeeks: 2,
      totalWeeks: 2,
      maximumScore: 200,
    });

    const page = await listRealDailyApprovals(baseInput);

    const trainee = page.items.find((t) => t.id === 'e1');
    expect(studentEnrollmentsApi.getScoreSummary).toHaveBeenCalledWith('e1');
    expect(trainee?.progressiveGrade.gradedCount).toBe(2);
    expect(trainee?.progressiveGrade.final20).toBe(17);
    expect(trainee?.progressiveGrade.statusLabel).toBe('قبول');
  });

  it('shows "در جریان" when the student has submitted but score-summary has no graded weeks yet', async () => {
    vi.mocked(studentEnrollmentsApi.listMentorStudents).mockResolvedValue({
      data: [{ id: 'e1', studentId: 's1', status: 'active' }],
      hasNextPage: false,
    });
    vi.mocked(studentEnrollmentsApi.listWeeks).mockResolvedValue([
      { id: 'w1', status: 'in_progress', studentStatus: 'send', submittedAt: '2026-01-01T00:00:00.000Z' },
    ]);
    vi.mocked(studentEnrollmentsApi.getScoreSummary).mockResolvedValue(null);

    const page = await listRealDailyApprovals(baseInput);

    const trainee = page.items.find((t) => t.id === 'e1');
    expect(trainee?.progressiveGrade.final20).toBeNull();
    expect(trainee?.progressiveGrade.statusLabel).toBe('در جریان');
  });

  it('sums real conversation unreadCount per trainee instead of always reporting 0', async () => {
    vi.mocked(studentEnrollmentsApi.listMentorStudents).mockResolvedValue({
      data: [
        { id: 'e1', studentId: 's1', status: 'active' },
        { id: 'e2', studentId: 's2', status: 'active' },
      ],
      hasNextPage: false,
    });
    vi.mocked(studentEnrollmentsApi.listWeeks).mockResolvedValue([]);
    vi.mocked(conversationsApi.listByEnrollment).mockImplementation(async (id: string) =>
      id === 'e1'
        ? ([{ unreadCount: 2 }, { unreadCount: 1 }] as never)
        : []
    );

    const page = await listRealDailyApprovals(baseInput);

    expect(page.items.find((t) => t.id === 'e1')?.unreadCount).toBe(3);
    expect(page.items.find((t) => t.id === 'e2')?.unreadCount).toBe(0);
  });

  it('does not crash the whole page when one trainee’s weeks fail to load', async () => {
    vi.mocked(studentEnrollmentsApi.listMentorStudents).mockResolvedValue({
      data: [
        { id: 'e1', studentId: 's1', status: 'active' },
        { id: 'e2', studentId: 's2', status: 'active' },
      ],
      hasNextPage: false,
    });
    vi.mocked(studentEnrollmentsApi.listWeeks).mockImplementation(async (id: string) => {
      if (id === 'e1') throw new Error('network down');
      return [{ id: 'w1', score: 50 }];
    });

    const page = await listRealDailyApprovals(baseInput);

    expect(page.items.find((t) => t.id === 'e1')?.weeks).toEqual([]);
    expect(page.items.find((t) => t.id === 'e2')?.weeks).toHaveLength(1);
  });

  it('only fetches weeks for rows that survive the client-side filters', async () => {
    vi.mocked(studentEnrollmentsApi.listMentorStudents).mockResolvedValue({
      data: [
        { id: 'e1', studentId: 's1', status: 'active', student: { firstName: 'سارا', lastName: 'احمدی' } },
        { id: 'e2', studentId: 's2', status: 'cancelled', student: { firstName: 'نادر', lastName: 'رحیمی' } },
      ],
      hasNextPage: false,
    });
    vi.mocked(studentEnrollmentsApi.listWeeks).mockResolvedValue([]);

    await listRealDailyApprovals({ ...baseInput, readFilter: 'read' });

    expect(studentEnrollmentsApi.listWeeks).toHaveBeenCalledTimes(1);
    expect(studentEnrollmentsApi.listWeeks).toHaveBeenCalledWith('e1');
  });
});

describe('refreshRealDailyApprovalTraineeDerived', () => {
  beforeEach(() => {
    vi.mocked(studentEnrollmentsApi.listWeeks).mockReset();
    vi.mocked(studentEnrollmentsApi.getScoreSummary).mockReset().mockResolvedValue(null);
    vi.mocked(conversationsApi.listByEnrollment).mockReset().mockResolvedValue([]);
    vi.mocked(getRealAcademicSettings)
      .mockReset()
      .mockResolvedValue({ globalProfessorCapacity: 30, passingScoreThreshold: 70 });
  });

  it('re-reads only the one trainee (weeks + conversations + score-summary), not the whole mentor list', async () => {
    vi.mocked(studentEnrollmentsApi.listWeeks).mockResolvedValue([
      { id: 'w1', status: 'completed', mentorStatus: 'send', score: 90 },
    ]);
    vi.mocked(conversationsApi.listByEnrollment).mockResolvedValue([
      { unreadCount: 2 } as never,
    ]);
    vi.mocked(studentEnrollmentsApi.getScoreSummary).mockResolvedValue({
      totalScore: 90,
      scoredWeeks: 1,
      totalWeeks: 1,
      maximumScore: 100,
    });

    const derived = await refreshRealDailyApprovalTraineeDerived('e1', 'active');

    expect(studentEnrollmentsApi.listMentorStudents).not.toHaveBeenCalled();
    expect(studentEnrollmentsApi.listWeeks).toHaveBeenCalledTimes(1);
    expect(studentEnrollmentsApi.listWeeks).toHaveBeenCalledWith('e1');
    expect(conversationsApi.listByEnrollment).toHaveBeenCalledTimes(1);
    expect(conversationsApi.listByEnrollment).toHaveBeenCalledWith('e1');
    expect(studentEnrollmentsApi.getScoreSummary).toHaveBeenCalledTimes(1);
    expect(studentEnrollmentsApi.getScoreSummary).toHaveBeenCalledWith('e1');
    expect(derived.weeks).toHaveLength(1);
    expect(derived.unreadCount).toBe(2);
    expect(derived.progressiveGrade.gradedCount).toBe(1);
  });

  it('matches listRealDailyApprovals for the same trainee (same derivation, single vs. batch)', async () => {
    vi.mocked(studentEnrollmentsApi.listMentorStudents).mockReset().mockResolvedValue({
      data: [{ id: 'e1', studentId: 's1', status: 'active' }],
      hasNextPage: false,
    });
    vi.mocked(studentEnrollmentsApi.listWeeks).mockResolvedValue([
      { id: 'w1', status: 'in_progress', studentStatus: 'send', submittedAt: '2026-01-01T00:00:00.000Z' },
    ]);

    const page = await listRealDailyApprovals(baseInput);
    const fromList = page.items.find((t) => t.id === 'e1');

    const derived = await refreshRealDailyApprovalTraineeDerived('e1', 'active');

    expect(derived).toEqual({
      weeks: fromList?.weeks,
      hasSubmitted: fromList?.hasSubmitted,
      unreadCount: fromList?.unreadCount,
      progressiveGrade: fromList?.progressiveGrade,
    });
  });
});

describe('loadRealDailyApprovalWeekDetail', () => {
  beforeEach(() => {
    vi.mocked(loadWeekConversationMessages).mockReset().mockResolvedValue([]);
  });

  it('returns the report submission time and feedback from all three roles, not just the viewer’s own', async () => {
    vi.mocked(loadWeekConversationMessages).mockResolvedValue([
      {
        id: 'sub-1',
        conversationId: 'c1',
        senderId: { id: 's1', role: 'student' },
        text: 'گزارش فراگیر',
        fileIds: [],
        files: [],
        sequence: 1,
        createdAt: '2026-01-01T08:00:00.000Z',
        updatedAt: '2026-01-01T08:00:00.000Z',
      },
      {
        id: 'm1',
        conversationId: 'c1',
        senderId: { id: 'mentor-1', role: 'teacher' },
        text: 'خوب بود',
        fileIds: [],
        files: [],
        rating: 4,
        sequence: 2,
        createdAt: '2026-01-01T09:00:00.000Z',
        updatedAt: '2026-01-01T09:00:00.000Z',
      },
      {
        id: 'm2',
        conversationId: 'c1',
        senderId: { id: 'principal-1', role: 'school_admin' },
        text: 'تایید',
        fileIds: [],
        files: [],
        rating: 5,
        sequence: 3,
        createdAt: '2026-01-01T10:00:00.000Z',
        updatedAt: '2026-01-01T10:00:00.000Z',
      },
    ]);

    // نقش بازکنندهٔ مودال معلم راهنماست، ولی بازخورد مدیر مدرسه هم باید برگردد —
    // برخلاف رفتار قدیم که فقط بازخورد خودِ نقش جاری را می‌خواند.
    const detail = await loadRealDailyApprovalWeekDetail({
      enrollmentId: 'e1',
      weekId: 'w1',
      role: 'mentor_teacher',
      teacherId: 'mentor-1',
    });

    expect(detail.text).toBe('گزارش فراگیر');
    expect(detail.submittedAt).toBe('2026-01-01T08:00:00.000Z');
    expect(detail.feedback).toEqual({
      mentor: 'خوب بود',
      mentorAt: '2026-01-01T09:00:00.000Z',
      mentorRating: '4',
      principal: 'تایید',
      principalAt: '2026-01-01T10:00:00.000Z',
      principalRating: '5',
    });
  });
});
