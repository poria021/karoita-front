import { beforeEach, describe, expect, it, vi } from 'vitest';

const listWeeksByLesson = vi.fn();
const createWeek = vi.fn();
const updateWeek = vi.fn();
const deleteWeek = vi.fn();
const getRealSyllabusSnapshot = vi.fn();

vi.mock('@/services/admin-catalog/admin-catalog.api', () => ({
  adminCatalogApi: {
    listWeeksByLesson: (...args: unknown[]) => listWeeksByLesson(...args),
    createWeek: (...args: unknown[]) => createWeek(...args),
    updateWeek: (...args: unknown[]) => updateWeek(...args),
    deleteWeek: (...args: unknown[]) => deleteWeek(...args),
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
    deleteWeek.mockReset();
    getRealSyllabusSnapshot.mockReset();
    getRealSyllabusSnapshot.mockResolvedValue(SNAPSHOT);
    createWeek.mockResolvedValue(null);
    updateWeek.mockResolvedValue(null);
    deleteWeek.mockResolvedValue(null);
  });

  it('POSTs only when GET is empty; extra local weeks on a published set are ignored', async () => {
    const lessonId = '6a8e2b51d2187e0f2fdb784c';
    listWeeksByLesson.mockResolvedValue([]);

    await saveRealSyllabusWeeks({
      courseOfferingId: lessonId,
      termId: '6a8e2b51d2187e0f2fdb784d',
      courseCatalogId: lessonId,
      weeks: [
        {
          id: 'week_local_1',
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

    expect(updateWeek).not.toHaveBeenCalled();
    expect(deleteWeek).not.toHaveBeenCalled();
    expect(createWeek).toHaveBeenCalledTimes(2);
    expect(listWeeksByLesson).toHaveBeenCalledWith(lessonId);
  });

  it('does not DELETE leftover remote weeks after the set is published', async () => {
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
      ],
    });

    expect(createWeek).not.toHaveBeenCalled();
    expect(updateWeek).not.toHaveBeenCalled();
    expect(deleteWeek).not.toHaveBeenCalled();
  });
});
