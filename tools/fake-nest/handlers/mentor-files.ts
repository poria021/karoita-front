/**
 * فایل‌های درس استاد: استاد برای یک درس ترم فایل‌ها را ثبت/حذف می‌کند و دانشجوی
 * همان درس، فایل‌های استادِ راهنمای خودش را می‌بیند (Swagger: «mentor only» و
 * «student/trainee only … files uploaded by the student's assigned professor»).
 */
import { requireRole, requireUser } from '../domain';
import { HttpError, noContent, ok } from '../http';
import type { Router } from '../router';
import { newId, nowIso, type Store, type StoredMentorLessonFile } from '../store';

import { storageUrl } from './files';

function recordDto(store: Store, record: StoredMentorLessonFile) {
  return {
    id: record.id,
    professorId: record.professorId,
    lessonId: record.lessonId,
    description: record.description,
    files: record.fileIds.map((id) => ({
      id,
      path: storageUrl(store, id),
      confirmedAt: store.files.get(id)?.confirmedAt ?? null,
    })),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function registerMentorFileRoutes(router: Router, store: Store): void {
  router.register('post', '/api/v1/mentor-lesson-files', (context) => {
    const user = requireUser(store, context);
    requireRole(user, 'mentor');
    const body = context.body as { lessonId: string; fileIds: string[]; description?: string };
    if (!store.lessons.has(body.lessonId)) throw new HttpError(404, 'Lesson not found');
    if (body.fileIds.length === 0) {
      throw new HttpError(422, 'Unprocessable Entity', { fileIds: 'at least one file is required' });
    }
    for (const id of body.fileIds) {
      const file = store.files.get(id);
      if (!file || file.status !== 'confirmed') {
        throw new HttpError(422, 'Unprocessable Entity', { fileIds: `file ${id} is not confirmed` });
      }
    }
    const now = nowIso();
    const record: StoredMentorLessonFile = {
      id: newId(),
      professorId: user.id,
      lessonId: body.lessonId,
      description: body.description?.trim() || null,
      fileIds: body.fileIds,
      createdAt: now,
      updatedAt: now,
    };
    store.mentorLessonFiles.set(record.id, record);
    return ok(recordDto(store, record), 201);
  });

  router.register('get', '/api/v1/mentor-lesson-files', (context) => {
    const user = requireUser(store, context);
    requireRole(user, 'mentor');
    return ok(
      [...store.mentorLessonFiles.values()]
        .filter((record) => record.professorId === user.id)
        .map((record) => recordDto(store, record))
    );
  });

  router.register('delete', '/api/v1/mentor-lesson-files/{id}', (context) => {
    const user = requireUser(store, context);
    requireRole(user, 'mentor');
    const record = store.mentorLessonFiles.get(context.params.id!);
    if (!record) throw new HttpError(404, 'Record not found');
    if (record.professorId !== user.id) throw new HttpError(403, 'Forbidden');
    store.mentorLessonFiles.delete(record.id);
    return noContent();
  });

  router.register('get', '/api/v1/lessons/{lessonId}/mentor-files', (context) => {
    const user = requireUser(store, context);
    requireRole(user, 'student', 'trainee');
    const lessonId = context.params.lessonId!;
    const professorIds = new Set(
      [...store.enrollments.values()]
        .filter(
          (row) =>
            row.studentId === user.id && row.lessonId === lessonId && row.status !== 'cancelled'
        )
        .map((row) => row.professorId)
    );
    return ok(
      [...store.mentorLessonFiles.values()]
        .filter((record) => record.lessonId === lessonId && professorIds.has(record.professorId))
        .map((record) => recordDto(store, record))
    );
  });
}
