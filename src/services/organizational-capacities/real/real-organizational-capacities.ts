import { reloadAfterWrite } from '@/lib/post-commit-refresh';
import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import { ApiClientError } from '@/services/api-error';
import {
  nestEntityId,
  nestLessonTitle,
  nestStructureForCapacityKind,
  parseGeneralProfessorCapacity,
  parseNestProfessorCapacityList,
  parseNestSemesterBundle,
  termTitleFromBundle,
  toCapacityCourseFromLesson,
  toSnapshot,
  toWriteDto,
} from '@/services/organizational-capacities/real/real-organizational-capacities-mappers';
import type {
  GetOrganizationalCapacitiesInput,
  OrganizationalCapacitiesSnapshot,
  OrganizationalCapacityCatalog,
  OrganizationalCapacityCourse,
  OrganizationalCapacityKind,
  SubmitOrganizationalCapacitiesInput,
} from '@/types/organizational-capacities';
import type {
  NestProfessorCapacity,
  NestSemesterWithLessons,
} from '@/types/nest-admin';

/** کاتالوگی که حتماً `bundles` و `maxCapacity` دارد (real). */
type RealCatalog = Required<OrganizationalCapacityCatalog>;

async function listSemesterBundles(
  kind: OrganizationalCapacityKind
): Promise<NestSemesterWithLessons[]> {
  const structure = nestStructureForCapacityKind(kind);
  const raw = await adminCatalogApi.listSemestersAll(structure);
  const bundles: NestSemesterWithLessons[] = [];
  for (const item of raw) {
    const parsed = parseNestSemesterBundle(item);
    if (parsed) bundles.push(parsed);
  }
  return bundles;
}

function termsFromBundles(
  bundles: NestSemesterWithLessons[]
): Array<{ id: string; title: string }> {
  return bundles.map((bundle) => ({
    id: bundle.id,
    title: termTitleFromBundle(bundle),
  }));
}

async function maxProfessorCapacity(): Promise<number> {
  try {
    return parseGeneralProfessorCapacity(
      await adminCatalogApi.getAcademicSettings()
    );
  } catch {
    return 15;
  }
}

/**
 * لود اولیهٔ صفحه: `GET semesters_all` + `GET settings` — هرکدام یک‌بار.
 * نتیجه در react-query cache می‌ماند و به `getRealOrganizationalCapacities` /
 * `submitRealOrganizationalCapacities` پاس داده می‌شود تا دوباره خوانده نشوند.
 */
export async function loadRealCapacityCatalog(
  kind: OrganizationalCapacityKind
): Promise<RealCatalog> {
  const [bundles, maxCapacity] = await Promise.all([
    listSemesterBundles(kind),
    maxProfessorCapacity(),
  ]);
  return { terms: termsFromBundles(bundles), bundles, maxCapacity };
}

async function resolveCatalog(
  kind: OrganizationalCapacityKind,
  provided?: OrganizationalCapacityCatalog
): Promise<RealCatalog> {
  if (provided?.bundles && provided.maxCapacity != null) {
    return {
      terms: provided.terms,
      bundles: provided.bundles,
      maxCapacity: provided.maxCapacity,
    };
  }
  return loadRealCapacityCatalog(kind);
}

export async function listRealCapacityTerms(
  kind: OrganizationalCapacityKind
): Promise<Array<{ id: string; title: string }>> {
  return termsFromBundles(await listSemesterBundles(kind));
}

export async function listRealCapacityCourses(
  kind: OrganizationalCapacityKind,
  termId: string
): Promise<Array<{ id: string; title: string }>> {
  const bundles = await listSemesterBundles(kind);
  const bundle =
    bundles.find((row) => row.id === termId) ?? bundles[0] ?? null;
  if (!bundle) return [];
  return (bundle.lessons ?? [])
    .map((lesson) => ({
      id: nestEntityId(lesson),
      title: nestLessonTitle(lesson),
    }))
    .filter((course) => course.id);
}

/**
 * ظرفیت‌های استاد برای یک ترم.
 * با `input.catalog` فقط یک GET (`professor-capacities?semesterId=`) می‌زند؛
 * بدون آن اول کاتالوگ (semesters_all + settings) را هم می‌خواند.
 */
export async function getRealOrganizationalCapacities(
  input: GetOrganizationalCapacitiesInput,
  professorId: string
): Promise<OrganizationalCapacitiesSnapshot> {
  const { bundles, maxCapacity, terms } = await resolveCatalog(
    input.kind,
    input.catalog
  );
  const bundle =
    bundles.find((row) => row.id === input.termId) ?? bundles[0] ?? null;
  if (!bundle) {
    return toSnapshot({
      kind: input.kind,
      termId: input.termId,
      termTitle: '',
      maxCapacity,
      courses: [],
      terms,
    });
  }

  const lessons = bundle.lessons ?? [];

  // فقط یک GET برای کل ترم (`?semesterId=` بدون `lessonId`).
  // ردیف هر درس را سمت کلاینت با professorId + lessonId پیدا می‌کنیم.
  const capacityRows = parseNestProfessorCapacityList(
    await adminCatalogApi.listProfessorCapacities({ semesterId: bundle.id })
  );
  const rowByLessonId = new Map<string, NestProfessorCapacity>();
  for (const item of capacityRows) {
    if (item.professorId !== professorId) continue;
    if (item.semesterId !== bundle.id) continue;
    rowByLessonId.set(item.lessonId, item);
  }

  const courses = lessons.flatMap((lesson) => {
    const lessonId = nestEntityId(lesson);
    if (!lessonId) return [];
    return [
      toCapacityCourseFromLesson({
        lesson,
        kind: input.kind,
        maxCapacity,
        row: rowByLessonId.get(lessonId) ?? null,
      }),
    ];
  });

  return toSnapshot({
    kind: input.kind,
    termId: bundle.id,
    termTitle: termTitleFromBundle(bundle),
    maxCapacity,
    courses,
    terms,
  });
}

type SubmitRow = {
  course: Pick<OrganizationalCapacityCourse, 'id' | 'total' | 'selectedDays'>;
  existsOnServer: boolean;
};

/**
 * الگوی ثابت: عملیات نوشتن (POST/PUT) → یک GET برای بازخوانی.
 * کاتالوگ و وضعیت `existsOnServer` از snapshot کلاینت می‌آید، پس پیش از نوشتن
 * هیچ GET اضافه‌ای نمی‌رود. فقط اگر کلاینت این داده‌ها را نداد، یک خواندن fallback می‌شود.
 */
export async function submitRealOrganizationalCapacities(
  input: SubmitOrganizationalCapacitiesInput,
  professorId: string
): Promise<OrganizationalCapacitiesSnapshot> {
  const catalog = await resolveCatalog(input.kind, input.catalog);
  const bundle =
    catalog.bundles.find((row) => row.id === input.termId) ??
    catalog.bundles[0] ??
    null;
  if (!bundle) {
    throw new ApiClientError('دوره تحصیلی یافت نشد.', 404);
  }
  const semesterId = bundle.id;
  const maxCapacity = input.maxCapacity ?? catalog.maxCapacity;

  let serverState: Map<string, boolean> | null = null;
  if (input.courses.some((course) => course.existsOnServer === undefined)) {
    // fallback: کلاینت وضعیت سرور را نفرستاده
    const current = await getRealOrganizationalCapacities(
      { kind: input.kind, termId: semesterId, catalog },
      professorId
    );
    serverState = new Map(
      current.courses.map((course) => [course.id, Boolean(course.existsOnServer)])
    );
  }

  const rows: SubmitRow[] = input.courses.map((patch) => ({
    course: {
      id: patch.courseId,
      total: patch.total,
      selectedDays: patch.selectedDays.slice(0, 1),
    },
    existsOnServer:
      patch.existsOnServer ?? serverState?.get(patch.courseId) ?? false,
  }));

  const hasData = ({ course }: SubmitRow) =>
    (course.total != null && course.total > 0) || course.selectedDays.length > 0;

  const creates = rows.filter((row) => !row.existsOnServer && hasData(row));
  const updates = rows.filter((row) => row.existsOnServer && hasData(row));

  const toBody = ({ course }: SubmitRow) =>
    toWriteDto({ professorId, semesterId, course, maxCapacity });

  // خالی = هنوز ردیفی نیست → POST؛ ردیف موجود با professorId+lessonId → PUT.
  if (creates.length > 0) {
    await adminCatalogApi.createProfessorCapacities(creates.map(toBody));
  }
  if (updates.length > 0) {
    await adminCatalogApi.updateProfessorCapacities(updates.map(toBody));
  }

  // بعد از نوشتن دقیقاً یک GET (کاتالوگ از cache می‌آید).
  return reloadAfterWrite(() =>
    getRealOrganizationalCapacities(
      { kind: input.kind, termId: semesterId, catalog },
      professorId
    )
  );
}
