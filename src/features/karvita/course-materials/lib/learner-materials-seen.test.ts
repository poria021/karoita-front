import { describe, expect, it } from 'vitest';

import type { CourseMaterial } from '@/types/course-materials';

import { countNewCourseMaterials } from './learner-materials-seen';

function material(
  overrides: Pick<CourseMaterial, 'id' | 'createdAt'>
): CourseMaterial {
  return {
    id: overrides.id,
    kind: 'internship',
    courseKey: 'course-1',
    courseLabel: 'کارورزی',
    title: 'جزوه',
    description: '',
    fileName: 'file.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1,
    fileUrl: 'https://example.com/file.pdf',
    authorId: 'u1',
    authorRole: 'professor',
    authorName: 'استاد',
    createdAt: overrides.createdAt,
  };
}

describe('countNewCourseMaterials', () => {
  it('counts all when never seen', () => {
    const rows = [
      material({ id: 'a', createdAt: '2026-01-02T00:00:00.000Z' }),
      material({ id: 'b', createdAt: '2026-01-01T00:00:00.000Z' }),
    ];
    expect(countNewCourseMaterials(rows, null)).toBe(2);
  });

  it('counts only materials newer than seenAt', () => {
    const rows = [
      material({ id: 'a', createdAt: '2026-01-03T00:00:00.000Z' }),
      material({ id: 'b', createdAt: '2026-01-01T00:00:00.000Z' }),
    ];
    expect(countNewCourseMaterials(rows, '2026-01-02T00:00:00.000Z')).toBe(1);
  });

  it('returns 0 when empty', () => {
    expect(countNewCourseMaterials([], null)).toBe(0);
  });
});
