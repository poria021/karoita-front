import { beforeEach, describe, expect, it, vi } from 'vitest';

const listWeeksByLesson = vi.fn();
const createWeek = vi.fn();
const updateWeek = vi.fn();
const getRealSyllabusSnapshot = vi.fn();

vi.mock('@/services/admin-catalog/admin-catalog.api', () => ({
  adminCatalogApi: {
    listWeeksByLesson: (...args: unknown[]) => listWeeksByLesson(...args),
    createWeek: (...args: unknown[]) => createWeek(...args),
    updateWeek: (...args: unknown[]) => updateWeek(...args),
  },
}));

vi.mock('@/services/syllabus-config/real/real-syllabus-reads', () => ({
  getRealAcademicSettings: vi.fn(),
  getRealSyllabusSnapshot: (...args: unknown[]) =>
    getRealSyllabusSnapshot(...args),
}));

import { saveRealSyllabusWeeks } from '@/services/syllabus-config/real/real-syllabus-mutations';
import type { SyllabusConfigSnapshot } from '@/types/syllabus-config';

const SNAPSHOT: SyllabusConfigSnapshot = {
  terms: [],
  offerings: {},
  internships: [],
  globalProfessorCapacity: 0,
  passingScoreThreshold: 0,
};

describe('saveRealSyllabusWeeks', () => {
  beforeEach(() => {
    listWeeksByLesson.mockReset();
    createWeek.mockReset();
    updateWeek.mockReset();
    getRealSyllabusSnapshot.mockReset();
    getRealSyllabusSnapshot.mockResolvedValue(SNAPSHOT);
    createWeek.mockResolvedValue(null);
    updateWeek.mockResolvedValue(null);
  });

  it('retires missing remote weeks, PATCHes Nest ids, then POSTs drafts', async () => {
    const lessonId = '6a8e2b51d2187e0f2fdb784c';
    listWeeksByLesson.mockResolvedValue([
      {
        id: '6a9164b4c208454ddf32ec92',
        lessonId,
        priority: 1,
        status: true,
      },
      {
        id: '6a9164b4c208454ddf32ec93',
        lessonId,
        priority: 2,
        status: true,
      },
    ]);

    await saveRealSyllabusWeeks({
      courseOfferingId: lessonId,
      termId: '6a8e2b51d2187e0f2fdb784d',
      courseCatalogId: lessonId,
      weeks: [
        {
          id: '6a9164b4c208454ddf32ec92',
          suffix: 'هفته 1',
          title: 'هفته 1',
          weight: 3,
          status: 'active',
        },
        {
          id: 'week_local_2',
          suffix: 'هفته 2',
          title: 'هفته 2',
          weight: 3,
          status: 'active',
        },
      ],
    });

    expect(updateWeek.mock.calls[0]).toEqual([
      '6a9164b4c208454ddf32ec93',
      { lessonId, priority: 10_001, status: false },
    ]);
    expect(updateWeek.mock.calls[1]).toEqual([
      '6a9164b4c208454ddf32ec92',
      { lessonId, priority: 1, status: true },
    ]);
    expect(createWeek).toHaveBeenCalledWith({
      lessonId,
      priority: 2,
      status: true,
    });
    expect(listWeeksByLesson).toHaveBeenCalledWith(lessonId);
  });
});
