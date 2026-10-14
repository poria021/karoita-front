/**
 * «تعریف دروس» مدیر ارشد: `original-lessons` — ردیف تخت `mainTitle` + `lessonTitle`.
 * ساخت گروهی یک درس با چند زیرمجموعه را در یک درخواست می‌گیرد و آرایهٔ ردیف‌ها را
 * برمی‌گرداند (Swagger: ۲۰۱ با آرایهٔ OriginalLesson).
 */
import { HttpError, ok, type RouteContext } from '../http';
import type { Router } from '../router';
import {
  newId,
  nowIso,
  paginate,
  type Store,
  type StoredOriginalLesson,
  type TermStructure,
} from '../store';

type BulkBody = {
  type: TermStructure;
  data: Array<{ mainTitle: string; lessons: Array<{ lessonTitle: string }> }>;
};

type PatchBody = Partial<
  Pick<StoredOriginalLesson, 'status' | 'type' | 'mainTitle' | 'lessonTitle'>
>;

export function originalLessonDto(row: StoredOriginalLesson) {
  return {
    id: row.id,
    type: row.type,
    mainTitle: row.mainTitle,
    lessonTitle: row.lessonTitle,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function findOriginalLesson(store: Store, context: RouteContext): StoredOriginalLesson {
  const row = store.originalLessons.get(context.params.id!);
  if (!row) throw new HttpError(404, 'Original lesson not found');
  return row;
}

export function registerOriginalLessonRoutes(router: Router, store: Store): void {
  router.register('post', '/api/v1/original-lessons', (context) => {
    const body = context.body as BulkBody;
    const now = nowIso();
    const created: StoredOriginalLesson[] = [];
    for (const group of body.data) {
      for (const lesson of group.lessons) {
        const row: StoredOriginalLesson = {
          id: newId(),
          type: body.type,
          mainTitle: group.mainTitle,
          lessonTitle: lesson.lessonTitle,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        };
        store.originalLessons.set(row.id, row);
        created.push(row);
      }
    }
    return ok(created.map(originalLessonDto), 201);
  });

  router.register('get', '/api/v1/original-lessons', (context) => {
    const mainTitle = context.query.get('mainTitle');
    const status = context.query.get('status');
    const rows = [...store.originalLessons.values()].filter(
      (row) =>
        (!mainTitle || row.mainTitle.includes(mainTitle)) &&
        (!status || row.status === status)
    );
    const page = paginate(rows, context.query);
    return ok({ data: page.data.map(originalLessonDto), hasNextPage: page.hasNextPage });
  });

  router.register('get', '/api/v1/original-lessons/{id}', (context) =>
    ok(originalLessonDto(findOriginalLesson(store, context)))
  );

  router.register('patch', '/api/v1/original-lessons/{id}', (context) => {
    const row = findOriginalLesson(store, context);
    const body = context.body as PatchBody;
    if (body.status !== undefined) row.status = body.status;
    if (body.type !== undefined) row.type = body.type;
    if (body.mainTitle !== undefined) row.mainTitle = body.mainTitle;
    if (body.lessonTitle !== undefined) row.lessonTitle = body.lessonTitle;
    row.updatedAt = nowIso();
    return ok(originalLessonDto(row));
  });

  router.register('delete', '/api/v1/original-lessons/{id}', (context) => {
    const row = findOriginalLesson(store, context);
    store.originalLessons.delete(row.id);
    // Swagger: ۲۰۰ بدون بدنه.
    return { status: 200 };
  });
}
