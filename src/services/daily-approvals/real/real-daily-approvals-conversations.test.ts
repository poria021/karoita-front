import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  findWeekConversationId,
  loadWeekConversationMessages,
} from './real-daily-approvals-conversations';
import { conversationsApi } from '@/services/conversations/real/conversations.api';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import type { NestConversation } from '@/types/nest-conversations';
import type { NestStudentWeek } from '@/types/nest-student-enrollments';

vi.mock('@/services/conversations/real/conversations.api', () => ({
  conversationsApi: {
    listByEnrollment: vi.fn(),
    listMessages: vi.fn(),
  },
}));

vi.mock('@/services/internship-enrollment/real/student-enrollments.api', () => ({
  studentEnrollmentsApi: {
    listWeeks: vi.fn(),
  },
}));

/**
 * شکل واقعی `GET /student-enrollments/{id}/weeks` لایو (`karoita.darkube.ir`،
 * ۱۴۰۵/۰۶/۲۷): `id` رکورد هفتهٔ دانشجوست، `weekId.id` تعریفِ هفته در سرفصل —
 * این دو با هم فرق دارند و قبلاً اشتباه گرفته می‌شدند.
 */
const week1: NestStudentWeek = {
  id: 'sw-week-1',
  enrollmentId: 'enr-1',
  weekId: { id: 'tpl-week-1', lessonId: 'les-1', priority: 3, status: true },
  status: 'in_progress',
  score: null,
};

const week2: NestStudentWeek = {
  id: 'sw-week-2',
  enrollmentId: 'enr-1',
  weekId: { id: 'tpl-week-2', lessonId: 'les-1', priority: 3, status: true },
  status: 'in_progress',
  score: null,
};

const conversationForWeek1: NestConversation = {
  id: 'conv-week-1',
  enrollmentId: 'enr-1',
  weekId: 'tpl-week-1',
  participantIds: [],
  type: 'week',
  lastMessageSequence: 0,
  readStates: [],
  unreadCount: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const conversationForWeek2: NestConversation = {
  ...conversationForWeek1,
  id: 'conv-week-2',
  weekId: 'tpl-week-2',
};

const generalConversation: NestConversation = {
  id: 'conv-general',
  enrollmentId: 'enr-1',
  weekId: null,
  participantIds: [],
  type: 'general',
  lastMessageSequence: 0,
  readStates: [],
  unreadCount: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('findWeekConversationId', () => {
  beforeEach(() => {
    vi.mocked(conversationsApi.listByEnrollment)
      .mockReset()
      .mockResolvedValue([conversationForWeek1, conversationForWeek2, generalConversation]);
    vi.mocked(studentEnrollmentsApi.listWeeks)
      .mockReset()
      .mockResolvedValue([week1, week2]);
    vi.mocked(conversationsApi.listMessages).mockReset().mockResolvedValue([]);
  });

  it('matches the per-week conversation via the week *template* id, not the student-week record id', async () => {
    const id = await findWeekConversationId('enr-1', 'sw-week-1');
    expect(id).toBe('conv-week-1');
  });

  it('resolves a different week to its own conversation, not the same one', async () => {
    const id1 = await findWeekConversationId('enr-1', 'sw-week-1');
    const id2 = await findWeekConversationId('enr-1', 'sw-week-2');
    expect(id1).not.toBe(id2);
  });

  it('falls back to the general conversation only when no matching week/conversation exists', async () => {
    const id = await findWeekConversationId('enr-1', 'sw-unknown');
    expect(id).toBe('conv-general');
  });

  it('accepts a pre-fetched weeks list instead of re-fetching GET .../weeks', async () => {
    const id = await findWeekConversationId('enr-1', 'sw-week-2', [week1, week2]);
    expect(id).toBe('conv-week-2');
    expect(studentEnrollmentsApi.listWeeks).not.toHaveBeenCalled();
  });

  it('dedupes concurrent calls for the same enrollment into a single GET conversations + GET weeks', async () => {
    // مثل باز کردن مودال نمره‌دهی: `loadWeekDetail` و `openWeek` تقریباً
    // هم‌زمان برای همان enrollment این تابع را صدا می‌زنند.
    const [id1, id2] = await Promise.all([
      findWeekConversationId('enr-1', 'sw-week-1'),
      findWeekConversationId('enr-1', 'sw-week-2'),
    ]);
    expect(id1).toBe('conv-week-1');
    expect(id2).toBe('conv-week-2');
    expect(conversationsApi.listByEnrollment).toHaveBeenCalledTimes(1);
    expect(studentEnrollmentsApi.listWeeks).toHaveBeenCalledTimes(1);
  });

  it('does not dedupe two genuinely separate (non-overlapping) calls', async () => {
    await findWeekConversationId('enr-1', 'sw-week-1');
    await findWeekConversationId('enr-1', 'sw-week-2');
    expect(conversationsApi.listByEnrollment).toHaveBeenCalledTimes(2);
    expect(studentEnrollmentsApi.listWeeks).toHaveBeenCalledTimes(2);
  });
});

describe('loadWeekConversationMessages', () => {
  beforeEach(() => {
    vi.mocked(conversationsApi.listByEnrollment)
      .mockReset()
      .mockResolvedValue([conversationForWeek1, conversationForWeek2, generalConversation]);
    vi.mocked(studentEnrollmentsApi.listWeeks)
      .mockReset()
      .mockResolvedValue([week1, week2]);
    vi.mocked(conversationsApi.listMessages).mockReset().mockResolvedValue([]);
  });

  it('reads messages from the correct per-week conversation, not the shared general one', async () => {
    await loadWeekConversationMessages('enr-1', 'sw-week-2');
    expect(conversationsApi.listMessages).toHaveBeenCalledWith('conv-week-2');
  });
});
