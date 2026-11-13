import { beforeEach, describe, expect, it, vi } from 'vitest';

const list = vi.fn();
const createBulk = vi.fn();
const update = vi.fn();
const remove = vi.fn();
const getRealSyllabusSnapshot = vi.fn();

vi.mock('@/services/original-lessons.api', () => ({
  originalLessonsApi: {
    list: (...args: unknown[]) => list(...args),
    createBulk: (...args: unknown[]) => createBulk(...args),
    update: (...args: unknown[]) => update(...args),
    remove: (...args: unknown[]) => remove(...args),
  },
}));

vi.mock('@/services/syllabus-config/real/real-syllabus-reads', () => ({
  getRealSyllabusSnapshot: (...args: unknown[]) => getRealSyllabusSnapshot(...args),
}));

vi.mock('@/lib/post-commit-refresh', () => ({
  reloadAfterWrite: async <T>(fn: () => Promise<T>) => fn(),
}));

import { updateRealCourseDefinition } from '@/services/syllabus-config/real/real-course-catalog';
import type { NestOriginalLesson } from '@/types/nest-original-lessons';
import type { SyllabusConfigSnapshot } from '@/types/syllabus-config';

function row(overrides: Partial<NestOriginalLesson>): NestOriginalLesson {
  return {
    id: 'row-1',
    type: 'semester',
    mainTitle: 'کاربست',
    lessonTitle: 'کاربست ۱',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const SNAPSHOT: SyllabusConfigSnapshot = {
  terms: [],
  offerings: {},
  internships: [],
  globalProfessorCapacity: 0,
  passingScoreThreshold: 0,
};

describe('updateRealCourseDefinition', () => {
  beforeEach(() => {
    list.mockReset();
    createBulk.mockReset();
    update.mockReset();
    remove.mockReset();
    getRealSyllabusSnapshot.mockReset();
    getRealSyllabusSnapshot.mockResolvedValue(SNAPSHOT);
    update.mockImplementation(async (id: string, body: Record<string, unknown>) =>
      row({ id, ...body })
    );
  });

  it('با زیرمجموعهٔ تازه کل گروه را یک‌جا POST می‌کند بعد از آزاد کردن mainTitle', async () => {
    const existing = [
      row({ id: 'a', lessonTitle: 'کاربست ۱' }),
      row({ id: 'b', lessonTitle: 'کاربست ۲' }),
    ];
    list.mockResolvedValue({ data: existing, hasNextPage: false });
    createBulk.mockResolvedValue([
      row({ id: 'n1', lessonTitle: 'کاربست ۱' }),
      row({ id: 'n2', lessonTitle: 'کاربست ۲' }),
      row({ id: 'n3', lessonTitle: 'کاربست ۳' }),
    ]);

    await updateRealCourseDefinition('semester::کاربست', {
      title: 'کاربست',
      audience: 'semester',
      isActive: true,
      subModules: [
        { id: 'a', title: 'کاربست ۱' },
        { id: 'b', title: 'کاربست ۲' },
        { title: 'کاربست ۳' },
      ],
    });

    expect(update.mock.calls.filter((call) => String(call[1]?.mainTitle ?? '').startsWith('__kv_stg_'))).toHaveLength(
      2
    );
    expect(createBulk).toHaveBeenCalledWith({
      type: 'semester',
      data: [
        {
          mainTitle: 'کاربست',
          lessons: [
            { lessonTitle: 'کاربست ۱' },
            { lessonTitle: 'کاربست ۲' },
            { lessonTitle: 'کاربست ۳' },
          ],
        },
      ],
    });
    expect(remove).toHaveBeenCalledWith('a');
    expect(remove).toHaveBeenCalledWith('b');
  });

  it('اگر POST بعد از کنار گذاشتن شکست بخورد، عنوان قبلی برمی‌گردد', async () => {
    list.mockResolvedValue({
      data: [row({ id: 'a', lessonTitle: 'کاربست ۱' })],
      hasNextPage: false,
    });
    createBulk.mockRejectedValue(new Error('boom'));

    await expect(
      updateRealCourseDefinition('semester::کاربست', {
        title: 'کاربست',
        audience: 'semester',
        isActive: true,
        subModules: [{ id: 'a', title: 'کاربست ۱' }, { title: 'کاربست ۲' }],
      })
    ).rejects.toThrow('boom');

    expect(update).toHaveBeenCalledWith('a', { mainTitle: 'کاربست' });
    expect(remove).not.toHaveBeenCalled();
  });

  it('بدون زیرمجموعهٔ تازه فقط PATCH می‌زند و شناسه‌ها را حفظ می‌کند', async () => {
    list.mockResolvedValue({
      data: [
        row({ id: 'a', lessonTitle: 'کاربست ۱' }),
        row({ id: 'b', lessonTitle: 'کاربست ۲' }),
      ],
      hasNextPage: false,
    });

    await updateRealCourseDefinition('semester::کاربست', {
      title: 'کاربست',
      audience: 'semester',
      isActive: true,
      subModules: [
        { id: 'a', title: 'کاربست ۱ ویرایش' },
        { id: 'b', title: 'کاربست ۲' },
      ],
    });

    expect(createBulk).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith('a', { lessonTitle: 'کاربست ۱ ویرایش' });
    expect(remove).not.toHaveBeenCalled();
  });
});
