import { describe, expect, it } from 'vitest';

import { mapMentorLessonFileRecord } from './mentor-lesson-file-mappers';

describe('mapMentorLessonFileRecord', () => {
  it('maps a record with populated files to one row per file, keeping the record id', () => {
    const rows = mapMentorLessonFileRecord(
      {
        id: 'rec1',
        lessonId: 'lesson1',
        mentorId: { id: 'm1', firstName: 'علی', lastName: 'رضایی' },
        description: ' جزوه ',
        fileIds: [
          { id: 'f1', path: 'uploads/a%20b.pdf' },
          { id: 'f2', path: 'uploads/pic.png', fileSize: 2048 },
        ],
        createdAt: '2026-10-10T00:00:00.000Z',
      },
      { kind: 'internship', courseLabel: 'کارورزی ۱' }
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      id: 'rec1:f1',
      recordId: 'rec1',
      courseKey: 'lesson1',
      courseLabel: 'کارورزی ۱',
      title: 'a b.pdf',
      description: 'جزوه',
      mimeType: 'application/pdf',
      fileUrl: 'uploads/a%20b.pdf',
      authorId: 'm1',
      authorName: 'علی رضایی',
    });
    expect(rows[1]).toMatchObject({ mimeType: 'image/png', sizeBytes: 2048 });
  });

  it('uses the record id as row id for a single file and tolerates bare file ids', () => {
    const rows = mapMentorLessonFileRecord(
      { id: 'rec2', lessonId: { id: 'lesson2', title: 'کارآموزی' }, fileIds: ['f9'] },
      { kind: 'apprenticeship' }
    );

    expect(rows).toEqual([
      expect.objectContaining({
        id: 'rec2',
        recordId: 'rec2',
        courseKey: 'lesson2',
        courseLabel: 'کارآموزی',
        fileUrl: '',
        title: 'فایل درس',
      }),
    ]);
  });
});
