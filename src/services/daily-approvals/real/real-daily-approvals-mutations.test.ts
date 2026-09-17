import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  markRealDailyApprovalWeekOpened,
  submitMentorFeedbackReal,
  submitPrincipalFeedbackReal,
} from './real-daily-approvals-mutations';
import { conversationsApi } from '@/services/conversations/real/conversations.api';
import { findWeekConversationId } from '@/services/daily-approvals/real/real-daily-approvals-conversations';

vi.mock('@/services/require-nest-transport', () => ({
  requireNestTransport: vi.fn(),
}));

vi.mock('@/services/internship-enrollment/real/student-weeks.api', () => ({
  studentWeeksApi: { score: vi.fn() },
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

  it('lets the principal submit only text, with no rating', async () => {
    await submitPrincipalFeedbackReal({
      traineeId: 't1',
      weekId: 'w1',
      principalFeedback: 'توضیح بدون امتیاز',
      principalRating: null,
    });

    expect(conversationsApi.postMessage).toHaveBeenCalledWith('conv-1', {
      text: 'توضیح بدون امتیاز',
    });
  });

  it('rejects a principal submission with neither rating nor text', async () => {
    await expect(
      submitPrincipalFeedbackReal({
        traineeId: 't1',
        weekId: 'w1',
        principalFeedback: '   ',
        principalRating: null,
      })
    ).rejects.toThrow(/امتیاز یا بازخورد/);
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
