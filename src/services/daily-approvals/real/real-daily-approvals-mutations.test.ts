import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  dropRealDailyApprovalTrainee,
  markRealDailyApprovalWeekOpened,
  scoreRealDailyApprovalWeek,
  submitMentorFeedbackReal,
  submitPrincipalFeedbackReal,
} from './real-daily-approvals-mutations';
import { conversationsApi } from '@/services/conversations/real/conversations.api';
import { findWeekConversationId } from '@/services/daily-approvals/real/real-daily-approvals-conversations';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import { studentWeeksApi } from '@/services/internship-enrollment/real/student-weeks.api';

vi.mock('@/services/require-nest-transport', () => ({
  requireNestTransport: vi.fn(),
}));

vi.mock('@/services/internship-enrollment/real/student-weeks.api', () => ({
  studentWeeksApi: {
    score: vi.fn(),
    setMentorPresent: vi.fn(),
    approveStudentPresent: vi.fn(),
    approveMentorPresent: vi.fn(),
  },
}));

vi.mock('@/services/internship-enrollment/real/student-enrollments.api', () => ({
  studentEnrollmentsApi: { cancel: vi.fn(async () => null) },
}));

vi.mock('@/services/conversations/real/conversations.api', () => ({
  conversationsApi: {
    postMessage: vi.fn(async () => undefined),
    markRead: vi.fn(async () => undefined),
  },
}));

vi.mock('@/services/daily-approvals/real/real-daily-approvals-conversations', () => ({
  findWeekConversationId: vi.fn(async () => 'conv-1'),
}));

describe('submitMentorFeedbackReal / submitPrincipalFeedbackReal', () => {
  beforeEach(() => {
    vi.mocked(conversationsApi.postMessage).mockClear();
    vi.mocked(findWeekConversationId).mockClear().mockResolvedValue('conv-1');
  });

  it('sends the mentor competency rating as a number alongside the text', async () => {
    await submitMentorFeedbackReal({
      traineeId: 't1',
      weekId: 'w1',
      mentorFeedback: 'عملکرد خوبی داشت',
      mentorRating: '4',
    });

    expect(conversationsApi.postMessage).toHaveBeenCalledWith('conv-1', {
      text: 'عملکرد خوبی داشت',
      rating: 4,
    });
  });

  it('sends the principal competency rating as a number alongside the text', async () => {
    await submitPrincipalFeedbackReal({
      traineeId: 't1',
      weekId: 'w1',
      principalFeedback: 'تایید می‌شود',
      principalRating: '5',
    });

    expect(conversationsApi.postMessage).toHaveBeenCalledWith('conv-1', {
      text: 'تایید می‌شود',
      rating: 5,
    });
  });

  it('lets the mentor submit a rating without any text — text is optional for mentors', async () => {
    await submitMentorFeedbackReal({
      traineeId: 't1',
      weekId: 'w1',
      mentorFeedback: '   ',
      mentorRating: '3',
    });

    expect(conversationsApi.postMessage).toHaveBeenCalledWith('conv-1', {
      rating: 3,
    });
  });

  it('lets the principal submit only a rating, with no text', async () => {
    await submitPrincipalFeedbackReal({
      traineeId: 't1',
      weekId: 'w1',
      principalFeedback: '',
      principalRating: '4',
    });

    expect(conversationsApi.postMessage).toHaveBeenCalledWith('conv-1', {
      rating: 4,
    });
  });

  it('rejects a principal submission without a rating, even when text is given', async () => {
    await expect(
      submitPrincipalFeedbackReal({
        traineeId: 't1',
        weekId: 'w1',
        principalFeedback: 'توضیح بدون امتیاز',
        principalRating: null,
      })
    ).rejects.toThrow(/امتیاز/);
    expect(conversationsApi.postMessage).not.toHaveBeenCalled();
  });
});

describe('markRealDailyApprovalWeekOpened', () => {
  beforeEach(() => {
    vi.mocked(conversationsApi.markRead).mockClear();
    vi.mocked(findWeekConversationId).mockClear();
  });

  it('marks the week conversation as read', async () => {
    vi.mocked(findWeekConversationId).mockResolvedValue('conv-1');

    await markRealDailyApprovalWeekOpened({ traineeId: 't1', weekId: 'w1' });

    expect(conversationsApi.markRead).toHaveBeenCalledWith('conv-1');
  });

  it('does not throw when the conversation is not found (best-effort)', async () => {
    vi.mocked(findWeekConversationId).mockRejectedValue(new Error('not found'));

    await expect(
      markRealDailyApprovalWeekOpened({ traineeId: 't1', weekId: 'w1' })
    ).resolves.toBeUndefined();
    expect(conversationsApi.markRead).not.toHaveBeenCalled();
  });
});

describe('dropRealDailyApprovalTrainee', () => {
  it('cancels the student enrollment by id', async () => {
    await dropRealDailyApprovalTrainee('enrollment-1');

    expect(studentEnrollmentsApi.cancel).toHaveBeenCalledWith('enrollment-1');
  });
});

describe('scoreRealDailyApprovalWeek', () => {
  beforeEach(() => {
    vi.mocked(studentWeeksApi.score).mockReset();
    vi.mocked(studentWeeksApi.setMentorPresent).mockReset();
  });

  const base = { traineeId: 't1', weekId: 'w1', advisorFeedback: '' };

  it('sends mentor-present before the score when the school was visited', async () => {
    const calls: string[] = [];
    vi.mocked(studentWeeksApi.setMentorPresent).mockImplementation(async () => {
      calls.push('mentor-present');
    });
    vi.mocked(studentWeeksApi.score).mockImplementation(async () => {
      calls.push('score');
    });

    await scoreRealDailyApprovalWeek({ ...base, score: 90, schoolVisited: true });

    expect(studentWeeksApi.setMentorPresent).toHaveBeenCalledWith('w1', true);
    expect(studentWeeksApi.score).toHaveBeenCalledWith('w1', 90, true);
    expect(calls).toEqual(['mentor-present', 'score']);
  });

  it('skips mentor-present when the school was not visited', async () => {
    await scoreRealDailyApprovalWeek({ ...base, score: 80, schoolVisited: false });

    expect(studentWeeksApi.setMentorPresent).not.toHaveBeenCalled();
    expect(studentWeeksApi.score).toHaveBeenCalledWith('w1', 80, false);
  });

  it('does not save the score when mentor-present fails', async () => {
    vi.mocked(studentWeeksApi.setMentorPresent).mockRejectedValue(new Error('403'));

    await expect(
      scoreRealDailyApprovalWeek({ ...base, score: 70, schoolVisited: true })
    ).rejects.toThrow('403');
    expect(studentWeeksApi.score).not.toHaveBeenCalled();
  });
});

describe('submitPrincipalFeedbackReal presence approvals', () => {
  beforeEach(() => {
    vi.mocked(conversationsApi.postMessage).mockReset();
    vi.mocked(studentWeeksApi.approveStudentPresent).mockReset();
    vi.mocked(studentWeeksApi.approveMentorPresent).mockReset();
  });

  const base = {
    traineeId: 't1',
    weekId: 'w1',
    principalFeedback: '',
    principalRating: '4' as const,
  };

  it('approves student and mentor presence with the earliest day, before the message', async () => {
    const calls: string[] = [];
    vi.mocked(studentWeeksApi.approveStudentPresent).mockImplementation(async () => {
      calls.push('student');
    });
    vi.mocked(studentWeeksApi.approveMentorPresent).mockImplementation(async () => {
      calls.push('mentor');
    });
    vi.mocked(conversationsApi.postMessage).mockImplementation(async () => {
      calls.push('message');
    });

    await submitPrincipalFeedbackReal({
      ...base,
      principalAttendance: ['2026-10-12', '2026-10-10'],
      principalSupervisorVisits: ['2026-10-11'],
    });

    expect(studentWeeksApi.approveStudentPresent).toHaveBeenCalledWith(
      'w1',
      true,
      new Date(2026, 9, 10).toISOString()
    );
    expect(studentWeeksApi.approveMentorPresent).toHaveBeenCalledWith(
      'w1',
      true,
      new Date(2026, 9, 11).toISOString()
    );
    expect(calls).toEqual(['student', 'mentor', 'message']);
  });

  it('skips approvals when no day is selected', async () => {
    await submitPrincipalFeedbackReal(base);

    expect(studentWeeksApi.approveStudentPresent).not.toHaveBeenCalled();
    expect(studentWeeksApi.approveMentorPresent).not.toHaveBeenCalled();
    expect(conversationsApi.postMessage).toHaveBeenCalled();
  });

  it('does not post the one-shot message when an approval fails', async () => {
    vi.mocked(studentWeeksApi.approveStudentPresent).mockRejectedValue(new Error('403'));

    await expect(
      submitPrincipalFeedbackReal({ ...base, principalAttendance: ['2026-10-10'] })
    ).rejects.toThrow('403');
    expect(conversationsApi.postMessage).not.toHaveBeenCalled();
  });
});
