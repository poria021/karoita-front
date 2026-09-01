import type {
  InternshipCapacity,
  InternshipEnrollmentActor,
  InternshipEnrollmentLevel,
  InternshipEnrollmentRecord,
  InternshipMentorCapacity,
  InternshipSchoolCapacity,
  InternshipSupervisor,
} from '@/types/internship-enrollment';
import { persianToEnglishDigits } from '@/utils/persianDigits';

export function hasAvailableCapacity(capacity: InternshipCapacity | undefined): boolean {
  return capacity === null || (typeof capacity === 'number' && capacity > 0);
}

export function normalizeEnrollmentCourseTitle(
  courseName: string,
  level: InternshipEnrollmentLevel
): string {
  return `${persianToEnglishDigits(courseName).trim()} ${level}`;
}

/**
 * وجود مقدار در فیلد چندانتخابی — `actor.district` ممکن است `string[]` باشد.
 */
function actorFieldIncludes(
  actorField: string | string[] | undefined,
  value: string
): boolean {
  if (!actorField) return false;
  if (Array.isArray(actorField)) return actorField.includes(value);
  return actorField === value;
}

/** اولین مقدار فیلد چندانتخابی. */
function firstOf(value: string | string[] | undefined, fallback: string): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export function hasEligibleSchoolMentorCascade(input: {
  actor: InternshipEnrollmentActor;
  level: InternshipEnrollmentLevel;
  schools: InternshipSchoolCapacity[];
  mentors: InternshipMentorCapacity[];
}): boolean {
  const { actor, level, schools, mentors } = input;
  const actorProvince = firstOf(actor.province, 'تهران');

  return schools.some((school) => {
    const isInDefaultScope =
      actor.specialPermissions?.crossFaculty ||
      (school.province === actorProvince &&
        (!actor.district ||
          (Array.isArray(actor.district) ? actor.district.length === 0 : false) ||
          actorFieldIncludes(actor.district, school.district)));

    if (!isInDefaultScope || !hasAvailableCapacity(school.capacities[level])) {
      return false;
    }

    return mentors.some(
      (mentor) =>
        mentor.schoolId === school.id && hasAvailableCapacity(mentor.capacities[level])
    );
  });
}

export function filterEligibleSupervisors(input: {
  supervisors: InternshipSupervisor[];
  actor: InternshipEnrollmentActor;
  level: InternshipEnrollmentLevel;
  query: string;
  province: string;
  college: string;
  schools: InternshipSchoolCapacity[];
  mentors: InternshipMentorCapacity[];
}): InternshipSupervisor[] {
  const normalizedQuery = input.query.trim().toLocaleLowerCase('fa-IR');
  const hasCascade = hasEligibleSchoolMentorCascade(input);

  if (!hasCascade) return [];

  return input.supervisors.filter((supervisor) => {
    if (supervisor.readOnly || !hasAvailableCapacity(supervisor.capacity)) return false;
    if (input.college && supervisor.college !== input.college) return false;
    if (input.province && supervisor.province !== input.province) return false;
    return (
      !normalizedQuery ||
      supervisor.name.toLocaleLowerCase('fa-IR').includes(normalizedQuery)
    );
  });
}

export function findConflictingActiveTermEnrollment(input: {
  records: InternshipEnrollmentRecord[];
  actor: InternshipEnrollmentActor;
  kind: 'internship' | 'apprenticeship';
  level: InternshipEnrollmentLevel;
  termId: string;
}): InternshipEnrollmentRecord | null {
  if (input.actor.role !== 'student' || input.kind !== 'internship') {
    return null;
  }

  return (
    input.records.find(
      (record) =>
        record.userId === input.actor.id &&
        record.termId === input.termId &&
        record.kind === 'internship' &&
        record.level !== input.level &&
        record.supervisorId !== null &&
        (record.status === undefined || record.status === 'active')
    ) ?? null
  );
}

export function hasStudentTermEnrollmentConflict(input: {
  records: InternshipEnrollmentRecord[];
  actor: InternshipEnrollmentActor;
  kind: 'internship' | 'apprenticeship';
  level: InternshipEnrollmentLevel;
  termId: string;
}): boolean {
  return findConflictingActiveTermEnrollment(input) !== null;
}
