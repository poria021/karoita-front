import { reloadAfterWrite } from '@/lib/post-commit-refresh';
import { ApiClientError } from '@/services/api-error';
import { originalLessonsApi } from '@/services/original-lessons.api';
import { validateCourseDefinitionInput } from '@/services/syllabus-config/course-catalog';
import {
  courseGroupId,
  groupOriginalLessons,
  planCourseUpdate,
  toNestBulkCreateBody,
} from '@/services/syllabus-config/real/real-course-catalog-mappers';
import { getRealSyllabusSnapshot } from '@/services/syllabus-config/real/real-syllabus-reads';
import type { NestOriginalLesson } from '@/types/nest-original-lessons';
import type {
  CourseDefinition,
  SyllabusConfigSnapshot,
  UpsertCourseDefinitionInput,
} from '@/types/syllabus-config';

/**
 * کاتالوگ دروس روی `/original-lessons` (ردیف تخت `mainTitle` + `lessonTitle`).
 * Nest شناسهٔ «درس» ندارد؛ شناسهٔ گروه از `type::mainTitle` ساخته می‌شود و
 * ویرایش/حذف روی همهٔ ردیف‌های آن گروه، یکی‌یکی و پشت‌سرهم، اجرا می‌شود (تراکنش نیست).
 */

const PAGE_LIMIT = 100;
const MAX_PAGES = 50;

async function fetchAllOriginalLessons(): Promise<NestOriginalLesson[]> {
  const rows: NestOriginalLesson[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await originalLessonsApi.list({ page, limit: PAGE_LIMIT });
    rows.push(...result.data);
    if (!result.hasNextPage) return rows;
  }
  throw new ApiClientError('تعداد دروس از سقف بارگذاری بیشتر است.', 500);
}

export async function listRealCourseDefinitions(): Promise<CourseDefinition[]> {
  return groupOriginalLessons(await fetchAllOriginalLessons());
}

/** ردیف‌های یک درس را از میان همه می‌جدا می‌کند؛ نبودنش ۴۰۴ است. */
function splitGroup(all: readonly NestOriginalLesson[], id: string) {
  const groupRows = all.filter((row) => courseGroupId(row.type, row.mainTitle) === id);
  if (groupRows.length === 0) {
    throw new ApiClientError('درس موردنظر یافت نشد.', 404);
  }
  const others = all.filter((row) => !groupRows.includes(row));
  return { groupRows, others };
}

/** snapshot ترم‌ها + کاتالوگ تازه؛ همان چیزی که hook صفحه با `applySnapshot` می‌خواهد. */
function reloadSnapshotWithCatalog(): Promise<SyllabusConfigSnapshot> {
  return reloadAfterWrite(async () => ({
    ...(await getRealSyllabusSnapshot()),
    courseCatalog: await listRealCourseDefinitions(),
  }));
}

/** `POST /original-lessons` سپس snapshot با کاتالوگ تازه (مثل بقیهٔ mutationهای real). */
export async function createRealCourseDefinition(
  input: UpsertCourseDefinitionInput
): Promise<SyllabusConfigSnapshot> {
  const existing = await listRealCourseDefinitions();
  const error = validateCourseDefinitionInput(input, existing);
  if (error) throw new ApiClientError(error, 400);

  await originalLessonsApi.createBulk(toNestBulkCreateBody(input));
  return reloadSnapshotWithCatalog();
}

/**
 * ترتیب: PATCH ردیف‌های موجود، POST ردیف‌های تازه، آخر DELETE ردیف‌های حذف‌شده.
 * اگر وسط راه خطا بیاید، مرحلهٔ حذف (مخرب‌ترین) هنوز اجرا نشده است.
 */
export async function updateRealCourseDefinition(
  id: string,
  input: UpsertCourseDefinitionInput
): Promise<SyllabusConfigSnapshot> {
  const { groupRows, others } = splitGroup(await fetchAllOriginalLessons(), id);
  const error = validateCourseDefinitionInput(input, groupOriginalLessons(others));
  if (error) throw new ApiClientError(error, 400);

  const plan = planCourseUpdate(groupRows, input);
  for (const patch of plan.patches) {
    await originalLessonsApi.update(patch.id, patch.body);
  }
  if (plan.create) {
    const created = await originalLessonsApi.createBulk(plan.create);
    if (plan.deactivateCreated) {
      for (const row of created) {
        await originalLessonsApi.update(row.id, { status: 'deactive' });
      }
    }
  }
  for (const rowId of plan.deleteIds) {
    await originalLessonsApi.remove(rowId);
  }
  return reloadSnapshotWithCatalog();
}

/** همهٔ ردیف‌های درس را حذف می‌کند؛ اگر سرور ردیفی را رد کند همان خطا بالا می‌آید. */
export async function deleteRealCourseDefinition(
  id: string
): Promise<SyllabusConfigSnapshot> {
  const { groupRows } = splitGroup(await fetchAllOriginalLessons(), id);
  for (const row of groupRows) {
    await originalLessonsApi.remove(row.id);
  }
  return reloadSnapshotWithCatalog();
}
