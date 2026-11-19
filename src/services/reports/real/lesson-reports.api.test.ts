import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getJson } = vi.hoisted(() => ({ getJson: vi.fn() }));

vi.mock('@/services/api-client', async () => {
  const { ApiClientError } = await import('@/services/api-error');
  return {
    ApiClientError,
    apiClient: { getJson, baseUrl: 'http://localhost/api/nest' },
  };
});

import {
  fetchLessonAverageScores,
  fetchLessonPendingReviews,
  lessonReportQuery,
  mapLessonAverageScores,
  mapLessonPendingReviews,
} from '@/services/reports/real/lesson-reports.api';

function searchParamsOf(callIndex = 0): Record<string, string | number> {
  return getJson.mock.calls[callIndex]![2].searchParams;
}

describe('lesson reports API (average-scores / pending-reviews)', () => {
  beforeEach(() => {
    getJson.mockReset();
  });

  it('مسیرها مطابق Swagger است و بدون فیلتر هیچ پارامتری نمی‌فرستد', async () => {
    getJson.mockResolvedValue({ data: [] });
    await fetchLessonAverageScores();
    await fetchLessonPendingReviews();
    expect(getJson.mock.calls[0]![0]).toBe('v1/reports/lessons/average-scores');
    expect(getJson.mock.calls[1]![0]).toBe('v1/reports/lessons/pending-reviews');
    expect(searchParamsOf(0)).toEqual({});
    expect(searchParamsOf(1)).toEqual({});
  });

  it('semesterId و structure را فقط وقتی مقدار دارند می‌فرستد؛ role هرگز', async () => {
    getJson.mockResolvedValue({ data: [] });
    await fetchLessonAverageScores({ semesterId: 's1' });
    await fetchLessonPendingReviews({ structure: 'podmani' });
    await fetchLessonPendingReviews({ semesterId: ' ', structure: undefined });
    expect(searchParamsOf(0)).toEqual({ semesterId: 's1' });
    expect(searchParamsOf(1)).toEqual({ structure: 'podmani' });
    expect(searchParamsOf(2)).toEqual({});
    expect(lessonReportQuery({ semesterId: 's1', structure: 'semester' })).toEqual({
      semesterId: 's1',
      structure: 'semester',
    });
  });

  it('میانگین: averageScore نامعتبر یا نبودِ نمره null می‌شود', () => {
    expect(
      mapLessonAverageScores({
        data: [
          { title: 'کارورزی 1', averageScore: 17.1 },
          { title: 'کارآموزی 1', averageScore: null },
          { title: 'کارآموزی 2' },
          { title: '  ', averageScore: 10 },
          { averageScore: 10 },
          null,
        ],
      })
    ).toEqual([
      { title: 'کارورزی 1', averageScore: 17.1 },
      { title: 'کارآموزی 1', averageScore: null },
      { title: 'کارآموزی 2', averageScore: null },
    ]);
  });

  it('کارت‌ها: pendingCount عدد است و data خالی/نامعتبر یعنی بدون کارت', () => {
    expect(
      mapLessonPendingReviews({
        data: [
          { title: 'کارآموزی 1', pendingCount: 7 },
          { title: 'کارورزی 1', pendingCount: 5 },
        ],
      })
    ).toEqual([
      { title: 'کارآموزی 1', pendingCount: 7 },
      { title: 'کارورزی 1', pendingCount: 5 },
    ]);
    expect(mapLessonPendingReviews({ data: [] })).toEqual([]);
    expect(mapLessonPendingReviews({})).toEqual([]);
    expect(mapLessonPendingReviews(null)).toEqual([]);
    expect(mapLessonAverageScores(undefined)).toEqual([]);
  });

  it('خطای API (مثل ۴۰۳ یا ۴۰۰) بالا می‌رود تا UI حالت خطا نشان دهد', async () => {
    getJson.mockRejectedValue(new Error('forbidden'));
    await expect(fetchLessonAverageScores()).rejects.toThrow('forbidden');
    await expect(fetchLessonPendingReviews({ semesterId: 'x' })).rejects.toThrow(
      'forbidden'
    );
  });
});
