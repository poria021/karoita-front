import { reloadAfterWrite } from '@/lib/post-commit-refresh';
import { ApiClientError } from '@/services/api-error';
import { originalLessonsApi } from '@/services/original-lessons.api';
import { validateCourseDefinitionInput } from '@/services/syllabus-config/course-catalog';
import {
  audienceToNestType,
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
 *
 * Nest روی `POST /original-lessons` یکتایی `mainTitle` (در همان type) را enforce می‌کند
 * و الحاق ردیف تازه به عنوان موجود را هم نمی‌پذیرد. برای افزودن زیرمجموعه، ردیف‌های
 * فعلی را موقتاً با عنوان staging کنار می‌گذاریم، کل گروه نهایی را یک‌جا POST
 * می‌کنیم، بعد ردیف‌های قدیمی را حذف می‌کنیم (شناسهٔ leafها عوض می‌شود).
 */

const PAGE_LIMIT = 100;
const MAX_PAGES = 50;

function stagingMainTitle(): string {
  return `__kv_stg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * وقتی زیرمجموعهٔ تازه لازم است: آزاد کردن `mainTitle` → POST کامل گروه → حذف ردیف‌های قبلی.
 * اگر POST شکست بخورد، ردیف‌های قبلی به عنوان اصلی برمی‌گردند.
 */
async function replaceCourseGroupRows(
  groupRows: readonly NestOriginalLesson[],
  input: UpsertCourseDefinitionInput
): Promise<void> {
  const desiredMainTitle = input.title.trim();
  if (!desiredMainTitle) {
    throw new ApiClientError('عنوان درس الزامی است.', 400);
  }
  const type = audienceToNestType(input.audience);
  const lessonTitles =
    input.subModules.length > 0
      ? input.subModules.map((sub) => sub.title.trim())
      : [desiredMainTitle];

  const staging = stagingMainTitle();
  for (const row of groupRows) {
    await originalLessonsApi.update(row.id, { mainTitle: staging });
  }

  let created: NestOriginalLesson[];
  try {
    created = await originalLessonsApi.createBulk({
      type,
      data: [
        {
          mainTitle: desiredMainTitle,
          lessons: lessonTitles.map((lessonTitle) => ({ lessonTitle })),
        },
      ],
    });
  } catch (err) {
    for (const row of groupRows) {
      await originalLessonsApi
        .update(row.id, { mainTitle: desiredMainTitle })
        .catch(() => undefined);
    }
    throw err;
  }

  for (const row of groupRows) {
    await originalLessonsApi.remove(row.id);
  }

  if (!input.isActive) {
    for (const row of created) {
      await originalLessonsApi.update(row.id, { status: 'deactive' });
    }
  }
}

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
 * بدون زیرمجموعهٔ تازه: PATCH / DELETE معمولی (شناسه‌ها حفظ می‌شوند).
 * با زیرمجموعهٔ تازه: به‌خاطر یکتایی Nest کل گروه بازسازی می‌شود.
 */
export async function updateRealCourseDefinition(
  id: string,
  input: UpsertCourseDefinitionInput
): Promise<SyllabusConfigSnapshot> {
  const { groupRows, others } = splitGroup(await fetchAllOriginalLessons(), id);
  const error = validateCourseDefinitionInput(input, groupOriginalLessons(others));
  if (error) throw new ApiClientError(error, 400);

  const plan = planCourseUpdate(groupRows, input);
  if (plan.create) {
    await replaceCourseGroupRows(groupRows, input);
    return reloadSnapshotWithCatalog();
  }

  for (const patch of plan.patches) {
    await originalLessonsApi.update(patch.id, patch.body);
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
