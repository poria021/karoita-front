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
  OrganizationalCapacityKind,
  SubmitOrganizationalCapacitiesInput,
} from '@/types/organizational-capacities';
import type { NestSemesterWithLessons } from '@/types/nest-admin';

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

export async function getRealOrganizationalCapacities(
  input: GetOrganizationalCapacitiesInput,
  professorId: string
): Promise<OrganizationalCapacitiesSnapshot> {
  const [bundles, maxCapacity] = await Promise.all([
    listSemesterBundles(input.kind),
    maxProfessorCapacity(),
  ]);
  const terms = termsFromBundles(bundles);
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
  const capacityLists = await Promise.all(
    lessons.map((lesson) => {
      const lessonId = nestEntityId(lesson);
      if (!lessonId) return Promise.resolve([]);
      return adminCatalogApi
        .listProfessorCapacities({
          lessonId,
          semesterId: bundle.id,
        })
        .then((raw) => parseNestProfessorCapacityList(raw));
    })
  );

  const courses = lessons.flatMap((lesson, index) => {
    const lessonId = nestEntityId(lesson);
    if (!lessonId) return [];
    const row =
      capacityLists[index]?.find(
        (item) =>
          item.professorId === professorId && item.lessonId === lessonId
      ) ?? null;
    return [
      toCapacityCourseFromLesson({
        lesson,
        kind: input.kind,
        maxCapacity,
        row,
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

export async function submitRealOrganizationalCapacities(
  input: SubmitOrganizationalCapacitiesInput,
  professorId: string
): Promise<OrganizationalCapacitiesSnapshot> {
  const current = await getRealOrganizationalCapacities(
    { kind: input.kind, termId: input.termId },
    professorId
  );
  if (!current.termId) {
    throw new ApiClientError('دوره تحصیلی یافت نشد.', 404);
  }

  const byId = new Map(input.courses.map((row) => [row.courseId, row]));
  const merged = current.courses.map((course) => {
    const patch = byId.get(course.id);
    if (!patch) return course;
    return {
      ...course,
      total: patch.total,
      selectedDays: patch.selectedDays.slice(0, 1),
    };
  });

  const creates = merged.filter((course) => !course.existsOnServer);
  const updates = merged.filter((course) => course.existsOnServer);

  const toBody = (course: (typeof merged)[number]) =>
    toWriteDto({
      professorId,
      semesterId: current.termId,
      course,
      maxCapacity: current.maxCapacity,
    });

  // خالی = هنوز ردیفی نیست → POST؛ ردیف موجود با professorId+lessonId → PUT.
  if (creates.length > 0) {
    await adminCatalogApi.createProfessorCapacities(creates.map(toBody));
  }
  if (updates.length > 0) {
    await adminCatalogApi.updateProfessorCapacities(updates.map(toBody));
  }

  return reloadAfterWrite(() =>
    getRealOrganizationalCapacities(
      { kind: input.kind, termId: current.termId },
      professorId
    )
  );
}
