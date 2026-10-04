import {
  courseDefinitionsOf,
  flattenCourseCatalog,
} from '@/services/syllabus-config/course-catalog';
import { mockSyllabusSnapshot } from '@/services/syllabus-config/mock/syllabus.fixtures';
import { summarizeCapacityCourses } from '@/utils/organizational-capacity-math';
import type {
  GetOrganizationalCapacitiesInput,
  OrganizationalCapacitiesSnapshot,
  OrganizationalCapacityCourse,
  OrganizationalCapacityKind,
} from '@/types/organizational-capacities';
import type { AcademicTermType } from '@/types/syllabus-config';

function termTypeForKind(kind: OrganizationalCapacityKind): AcademicTermType {
  return kind === 'apprenticeship' ? 'modular' : 'semester';
}

export function mockCapacityTerms(
  kind: OrganizationalCapacityKind
): Array<{ id: string; title: string }> {
  const type = termTypeForKind(kind);
  return mockSyllabusSnapshot()
    .terms.filter((term) => term.type === type)
    .map((term) => ({ id: term.id, title: term.title }));
}

/** snapshot ثابت ظرفیت — درس‌ها از کاتالوگ ثابت سرفصل؛ هیچ چیز ذخیره نمی‌شود. */
export function mockCapacitiesSnapshot(
  input: GetOrganizationalCapacitiesInput
): OrganizationalCapacitiesSnapshot {
  const { kind } = input;
  const syllabus = mockSyllabusSnapshot();
  const terms = mockCapacityTerms(kind);
  const term = terms.find((t) => t.id === input.termId) ?? terms[0] ?? {
    id: input.termId,
    title: 'نیم‌سال تحصیلی',
  };
  const courses: OrganizationalCapacityCourse[] = flattenCourseCatalog(
    courseDefinitionsOf(syllabus),
    termTypeForKind(kind)
  ).map((item, index) => ({
    id: item.id,
    title: item.title,
    kind,
    groupId: item.groupId,
    groupTitle: item.groupTitle,
    total: 15,
    confirmed: index === 0 ? 2 : 0,
    selectedDays: ['sat'],
  }));
  return {
    termId: term.id,
    termTitle: term.title,
    kind,
    maxCapacity: syllabus.globalProfessorCapacity,
    status: 'draft',
    courses,
    summary: summarizeCapacityCourses(courses),
    terms,
  };
}
