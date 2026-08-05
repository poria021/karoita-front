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

export function hasEligibleSchoolMentorCascade(input: {
  actor: InternshipEnrollmentActor;
  level: InternshipEnrollmentLevel;
  schools: InternshipSchoolCapacity[];
  mentors: InternshipMentorCapacity[];
}): boolean {
  const { actor, level, schools, mentors } = input;

  return schools.some((school) => {
    const isInDefaultScope =
      actor.specialPermissions?.crossFaculty ||
      (school.province === (actor.province ?? 'تهران') &&
        (!actor.district || school.district === actor.district));

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
