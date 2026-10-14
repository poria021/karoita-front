/**
 * ترم، درس‌های ترم، هفته‌ها، تنظیمات عمومی و ظرفیت استاد.
 *
 * رفتار «درس‌های ترم هنگام ساخت ترم» در Swagger مستند نیست. حالت پیش‌فرض همان است
 * که روی بک‌اند واقعی دیده شده (فهرست ثابت کارورزی/کارآموزی)؛
 * `FAKE_NEST_TERM_LESSONS=original` تغییر درخواستی از بک‌اند را شبیه‌سازی می‌کند
 * (ساخت از «تعریف دروس» فعال + `originalLessonId`) تا فرانت پیش از آمدنش آماده شود.
 */
import { HttpError, noContent, ok, type RouteContext } from '../http';
import type { Router } from '../router';
import {
  newId,
  nowIso,
  type Store,
  type StoredLesson,
  type StoredSemester,
  type StoredWeek,
  type TermStructure,
} from '../store';

export type TermLessonsMode = 'fixed' | 'original';

const FIXED_LESSON_TITLES: Record<TermStructure, string[]> = {
  semester: ['کارورزی ۱', 'کارورزی ۲', 'کارورزی ۳', 'کارورزی ۴'],
  podmani: ['کارآموزی ۱', 'کارآموزی ۲'],
};

type SemesterBody = {
  season?: StoredSemester['season'];
  structure?: TermStructure;
  academicYear?: string;
  courseSelection?: boolean;
  startClasses?: boolean;
};

type WeekItem = { priority: number; status: boolean };

/** GET `/admin/semester` و پاسخ ساخت/ویرایش: ترم کامل با گیت‌ها. */
function semesterDto(row: StoredSemester) {
  return {
    id: row.id,
    season: row.season,
    structure: row.structure,
    academicYear: row.academicYear,
    courseSelection: row.courseSelection,
    startClasses: row.startClasses,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function weekDto(row: StoredWeek) {
  return {
    id: row.id,
    lessonId: row.lessonId,
    priority: row.priority,
    status: row.status,
  };
}

function weeksOfLesson(store: Store, lessonId: string): StoredWeek[] {
  return [...store.weeks.values()].filter((week) => week.lessonId === lessonId);
}

function lessonDto(store: Store, lesson: StoredLesson) {
  return {
    id: lesson.id,
    semesterId: lesson.semesterId,
    title: lesson.title,
    status: lesson.status,
    ...(lesson.originalLessonId ? { originalLessonId: lesson.originalLessonId } : {}),
    weeks: weeksOfLesson(store, lesson.id).map(weekDto),
  };
}

export function createTermLessons(
  store: Store,
  semester: StoredSemester,
  mode: TermLessonsMode
): void {
  const now = nowIso();
  const sources: Array<{ title: string; originalLessonId?: string }> =
    mode === 'original'
      ? [...store.originalLessons.values()]
          .filter((row) => row.type === semester.structure && row.status === 'active')
          .map((row) => ({ title: row.lessonTitle, originalLessonId: row.id }))
      : FIXED_LESSON_TITLES[semester.structure].map((title) => ({ title }));
  for (const source of sources) {
    const lesson: StoredLesson = {
      id: newId(),
      semesterId: semester.id,
      title: source.title,
      status: false,
      createdAt: now,
      updatedAt: now,
      ...(source.originalLessonId ? { originalLessonId: source.originalLessonId } : {}),
    };
    store.lessons.set(lesson.id, lesson);
  }
}

function findSemester(store: Store, context: RouteContext): StoredSemester {
  const row = store.semesters.get(context.params.id!);
  if (!row) throw new HttpError(404, 'Semester not found');
  return row;
}

function findLesson(store: Store, lessonId: string): StoredLesson {
  const row = store.lessons.get(lessonId);
  if (!row) throw new HttpError(404, 'Lesson not found');
  return row;
}

/** Swagger (PATCH ترم، ۴۰۰): ترم تکراری، یا ترم دیگری با همان فصل/ساختار که انتخاب واحدش باز است. */
function assertSemesterUpdateAllowed(
  store: Store,
  current: StoredSemester,
  next: StoredSemester
): void {
  const others = [...store.semesters.values()].filter((row) => row.id !== current.id);
  const duplicate = others.some(
    (row) =>
      row.season === next.season &&
      row.structure === next.structure &&
      row.academicYear === next.academicYear
  );
  if (duplicate) throw new HttpError(400, 'Duplicate semester');
  if (next.courseSelection) {
    const conflict = others.some(
      (row) =>
        row.season === next.season &&
        row.structure === next.structure &&
        row.courseSelection
    );
    if (conflict) {
      throw new HttpError(
        400,
        'Another semester with the same season and structure already has course selection open.'
      );
    }
  }
}

function removeSemesterCascade(store: Store, semesterId: string): void {
  for (const lesson of [...store.lessons.values()]) {
    if (lesson.semesterId !== semesterId) continue;
    for (const week of weeksOfLesson(store, lesson.id)) store.weeks.delete(week.id);
    store.lessons.delete(lesson.id);
  }
  for (const capacity of [...store.professorCapacities.values()]) {
    if (capacity.semesterId === semesterId) store.professorCapacities.delete(capacity.id);
  }
  store.semesters.delete(semesterId);
}

export function registerSyllabusRoutes(
  router: Router,
  store: Store,
  options: { termLessons: TermLessonsMode }
): void {
  // ─── ترم ───
  router.register('post', '/api/admin/semester', (context) => {
    const body = context.body as Required<Pick<SemesterBody, 'season' | 'structure' | 'academicYear'>> &
      SemesterBody;
    const now = nowIso();
    const semester: StoredSemester = {
      id: newId(),
      season: body.season,
      structure: body.structure,
      academicYear: body.academicYear,
      courseSelection: body.courseSelection ?? false,
      startClasses: body.startClasses ?? false,
      createdAt: now,
      updatedAt: now,
    };
    store.semesters.set(semester.id, semester);
    createTermLessons(store, semester, options.termLessons);
    return ok(semesterDto(semester), 201);
  });

  router.register('get', '/api/admin/semester', () =>
    ok([...store.semesters.values()].map(semesterDto))
  );

  router.register('get', '/api/admin/semester/{id}', (context) =>
    ok(semesterDto(findSemester(store, context)))
  );

  router.register('patch', '/api/admin/semester/{id}', (context) => {
    const row = findSemester(store, context);
    const body = context.body as SemesterBody;
    const next: StoredSemester = {
      ...row,
      ...(body.season !== undefined ? { season: body.season } : {}),
      ...(body.structure !== undefined ? { structure: body.structure } : {}),
      ...(body.academicYear !== undefined ? { academicYear: body.academicYear } : {}),
      ...(body.courseSelection !== undefined ? { courseSelection: body.courseSelection } : {}),
      ...(body.startClasses !== undefined ? { startClasses: body.startClasses } : {}),
    };
    assertSemesterUpdateAllowed(store, row, next);
    Object.assign(row, next, { updatedAt: nowIso() });
    return ok(semesterDto(row));
  });

  router.register('delete', '/api/admin/semester/{id}', (context) => {
    removeSemesterCascade(store, findSemester(store, context).id);
    return { status: 200 };
  });

  /**
   * رفتار لایو (طبق یادداشت‌های فرانت): ردیف‌ها `academicYears` (جمع) می‌دهند و گیت
   * ندارند؛ گیت‌ها فقط از `GET /admin/semester` می‌آیند.
   */
  router.register('get', '/api/admin/semesters_all', (context) => {
    const structure = context.query.get('structure');
    const rows = [...store.semesters.values()].filter(
      (row) => !structure || row.structure === structure
    );
    return ok(
      rows.map((row) => ({
        id: row.id,
        season: row.season,
        structure: row.structure,
        academicYears: row.academicYear,
        lessons: [...store.lessons.values()]
          .filter((lesson) => lesson.semesterId === row.id)
          .map((lesson) => lessonDto(store, lesson)),
      }))
    );
  });

  // ─── درس ───
  router.register('patch', '/api/admin/lessons/{id}/status', (context) => {
    const lesson = findLesson(store, context.params.id!);
    const { status } = context.body as { status?: boolean };
    if (status !== undefined) lesson.status = status;
    lesson.updatedAt = nowIso();
    return noContent();
  });

  router.register('patch', '/api/admin/lessons/status', (context) => {
    const items = context.body as Array<{ id: string; status?: boolean }>;
    // همه‌یا‌هیچ: اول همه را بررسی کن تا نیمه‌کاره اعمال نشود.
    const lessons = items.map((item) => findLesson(store, item.id));
    items.forEach((item, index) => {
      if (item.status !== undefined) lessons[index]!.status = item.status;
      lessons[index]!.updatedAt = nowIso();
    });
    return noContent();
  });

  router.register('put', '/api/admin/lessons/{lessonId}/weeks', (context) => {
    const lesson = findLesson(store, context.params.lessonId!);
    const { weeks } = context.body as { weeks: WeekItem[] };
    for (const week of weeksOfLesson(store, lesson.id)) store.weeks.delete(week.id);
    const now = nowIso();
    for (const item of weeks) {
      const row: StoredWeek = {
        id: newId(),
        lessonId: lesson.id,
        priority: item.priority,
        status: item.status,
        createdAt: now,
      };
      store.weeks.set(row.id, row);
    }
    return noContent();
  });

  // ─── هفته ───
  router.register('get', '/api/admin/weeks/lesson/{lessonId}', (context) => {
    const lesson = findLesson(store, context.params.lessonId!);
    return ok(weeksOfLesson(store, lesson.id).map(weekDto));
  });

  router.register('post', '/api/admin/weeks', (context) => {
    const body = context.body as { lessonId: string; priority: number; status: boolean };
    findLesson(store, body.lessonId);
    const row: StoredWeek = {
      id: newId(),
      lessonId: body.lessonId,
      priority: body.priority,
      status: body.status,
      createdAt: nowIso(),
    };
    store.weeks.set(row.id, row);
    return noContent();
  });

  router.register('patch', '/api/admin/weeks/{id}', (context) => {
    const row = store.weeks.get(context.params.id!);
    if (!row) throw new HttpError(404, 'Week not found');
    const body = context.body as Partial<WeekItem> & { lessonId?: string };
    if (body.lessonId !== undefined) {
      findLesson(store, body.lessonId);
      row.lessonId = body.lessonId;
    }
    if (body.priority !== undefined) row.priority = body.priority;
    if (body.status !== undefined) row.status = body.status;
    return noContent();
  });

  // ─── تنظیمات عمومی (هر POST ردیف تازه؛ GET آخرین) ───
  router.register('post', '/api/admin/settings', (context) => {
    const body = context.body as {
      generalProfessorCapacity: number;
      systemPassingScore: number;
    };
    const row = {
      id: newId(),
      generalProfessorCapacity: body.generalProfessorCapacity,
      systemPassingScore: body.systemPassingScore,
      createdAt: nowIso(),
    };
    store.settings.push(row);
    return ok(row, 201);
  });

  router.register('get', '/api/admin/settings', () => {
    const latest = store.settings[store.settings.length - 1];
    if (!latest) throw new HttpError(404, 'Settings not found');
    return ok(latest);
  });

  // ─── ظرفیت استاد ───
  const capacityDto = (row: { id: string; professorId: string; lessonId: string; semesterId: string; capacity: number; days: number[] }) => ({
    id: row.id,
    professorId: row.professorId,
    lessonId: row.lessonId,
    semesterId: row.semesterId,
    capacity: row.capacity,
    days: row.days,
  });

  const assertCapacityItems = (
    items: Array<{ capacity: number; days: number[]; lessonId: string; semesterId: string }>
  ) => {
    const max = store.settings[store.settings.length - 1]?.generalProfessorCapacity;
    for (const item of items) {
      const errors: Record<string, string> = {};
      if (max !== undefined && item.capacity > max) {
        errors.capacity = 'capacityExceedsGeneralLimit';
      }
      if (new Set(item.days).size !== item.days.length || item.days.length === 0) {
        errors.days = 'daysMustBeUniqueAndNotEmpty';
      }
      if (Object.keys(errors).length > 0) {
        throw new HttpError(422, 'Unprocessable Entity', errors);
      }
      findLesson(store, item.lessonId);
      if (!store.semesters.has(item.semesterId)) {
        throw new HttpError(404, 'Semester not found');
      }
    }
  };

  type CapacityItem = {
    professorId: string;
    lessonId: string;
    semesterId: string;
    capacity: number;
    days: number[];
  };

  router.register('get', '/api/admin/professor-capacities', (context) => {
    const lessonId = context.query.get('lessonId');
    const semesterId = context.query.get('semesterId');
    return ok(
      [...store.professorCapacities.values()]
        .filter(
          (row) =>
            (!lessonId || row.lessonId === lessonId) &&
            (!semesterId || row.semesterId === semesterId)
        )
        .map(capacityDto)
    );
  });

  router.register('post', '/api/admin/professor-capacities', (context) => {
    const items = context.body as CapacityItem[];
    assertCapacityItems(items);
    for (const item of items) {
      const row = { id: newId(), ...item };
      store.professorCapacities.set(row.id, row);
    }
    return noContent();
  });

  router.register('put', '/api/admin/professor-capacities', (context) => {
    const items = context.body as CapacityItem[];
    assertCapacityItems(items);
    const rows = items.map((item) => {
      const row = [...store.professorCapacities.values()].find(
        (candidate) =>
          candidate.professorId === item.professorId &&
          candidate.lessonId === item.lessonId &&
          candidate.semesterId === item.semesterId
      );
      if (!row) throw new HttpError(404, 'Professor capacity not found');
      return row;
    });
    items.forEach((item, index) => {
      rows[index]!.capacity = item.capacity;
      rows[index]!.days = item.days;
    });
    return noContent();
  });
}
