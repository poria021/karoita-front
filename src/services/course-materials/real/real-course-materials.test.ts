import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  deleteRealCourseMaterial,
  listRealReceivedCourseMaterials,
  publishRealCourseMaterial,
} from './real-course-materials';
import { FilesService } from '@/services/files.service';
import { mentorLessonFilesApi } from '@/services/mentor-lesson-files.api';

vi.mock('@/services/require-nest-transport', () => ({
  requireNestTransport: vi.fn(),
}));

vi.mock('@/store/useUserStore', () => ({
  useUserStore: {
    getState: () => ({ activeUser: { role: 'supervisor_professor' } }),
  },
}));

vi.mock('@/services/files.service', () => ({
  FilesService: {
    uploadFile: vi.fn(async () => ({ id: 'file-1', path: 'uploads/notes.pdf' })),
  },
}));

vi.mock('@/services/mentor-lesson-files.api', () => ({
  mentorLessonFilesApi: {
    create: vi.fn(async () => ({ id: 'rec-1' })),
    list: vi.fn(async () => []),
    remove: vi.fn(async () => null),
    listForStudent: vi.fn(async () => [
      { id: 'rec-1', fileIds: [{ id: 'file-1', path: 'uploads/notes.pdf' }] },
    ]),
  },
}));

describe('real course materials', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uploads the file then links it to the lesson with the description', async () => {
    const file = new File(['x'], 'notes.pdf', { type: 'application/pdf' });

    const row = await publishRealCourseMaterial({
      kind: 'internship',
      courseKey: 'lesson-1',
      courseLabel: 'کارورزی ۱',
      title: 'notes.pdf',
      description: '  فصل اول ',
      file,
    });

    expect(FilesService.uploadFile).toHaveBeenCalledWith(file);
    expect(mentorLessonFilesApi.create).toHaveBeenCalledWith({
      lessonId: 'lesson-1',
      fileIds: ['file-1'],
      description: 'فصل اول',
    });
    expect(row).toMatchObject({
      id: 'rec-1',
      courseKey: 'lesson-1',
      title: 'notes.pdf',
      fileUrl: 'uploads/notes.pdf',
    });
  });

  it('does not upload when validation fails', async () => {
    await expect(
      publishRealCourseMaterial({
        kind: 'internship',
        courseKey: '',
        courseLabel: '',
        title: 'a.pdf',
        description: '',
        file: new File(['x'], 'a.pdf'),
      })
    ).rejects.toThrow();
    expect(FilesService.uploadFile).not.toHaveBeenCalled();
  });

  it('lists the student files for the lesson', async () => {
    const rows = await listRealReceivedCourseMaterials('internship', 'lesson-1');

    expect(mentorLessonFilesApi.listForStudent).toHaveBeenCalledWith('lesson-1');
    expect(rows[0]).toMatchObject({ courseKey: 'lesson-1', title: 'notes.pdf' });
  });

  it('deletes by record id', async () => {
    await deleteRealCourseMaterial('rec-1');

    expect(mentorLessonFilesApi.remove).toHaveBeenCalledWith('rec-1');
  });
});
