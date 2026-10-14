import { describe, expect, it } from 'vitest';

import type { NestMentorLessonFile } from '@/types/nest-mentor-lesson-files';

import { mapMentorLessonFileRecord } from './mentor-lesson-file-mappers';

function record(overrides: Partial<NestMentorLessonFile> = {}): NestMentorLessonFile {
  return {
    id: 'rec1',
    professorId: 'prof1',
    lessonId: 'lesson1',
    description: ' جزوه ',
    files: [
      { id: 'f1', path: 'https://cdn.example/uploads/a%20b.pdf?X-Amz-Signature=x' },
      { id: 'f2', path: 'https://cdn.example/uploads/pic.png', confirmedAt: null },
    ],
    createdAt: '2026-10-10T00:00:00.000Z',
    updatedAt: '2026-10-10T00:00:00.000Z',
    ...overrides,
  };
}

describe('mapMentorLessonFileRecord', () => {
  it('maps each file to a row, keeping the record id for deletion', () => {
    const rows = mapMentorLessonFileRecord(record(), {
      kind: 'internship',
      courseLabel: 'کارورزی ۱',
    });

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      id: 'rec1:f1',
      recordId: 'rec1',
      courseKey: 'lesson1',
      courseLabel: 'کارورزی ۱',
      title: 'a b.pdf',
      description: 'جزوه',
      mimeType: 'application/pdf',
      fileUrl: 'https://cdn.example/uploads/a%20b.pdf?X-Amz-Signature=x',
      authorId: 'prof1',
      sizeBytes: 0,
      createdAt: '2026-10-10T00:00:00.000Z',
    });
    expect(rows[1]).toMatchObject({ id: 'rec1:f2', mimeType: 'image/png' });
  });

  it('uses the record id as the row id for a single file', () => {
    const rows = mapMentorLessonFileRecord(
      record({ files: [{ id: 'f9', path: 'https://cdn.example/notes' }], description: null }),
      { kind: 'apprenticeship' }
    );

    expect(rows).toEqual([
      expect.objectContaining({
        id: 'rec1',
        recordId: 'rec1',
        description: '',
        mimeType: 'application/octet-stream',
        courseLabel: '',
      }),
    ]);
  });

  it('returns no rows for a record without files', () => {
    expect(mapMentorLessonFileRecord(record({ files: [] }), { kind: 'internship' })).toEqual([]);
  });
});
