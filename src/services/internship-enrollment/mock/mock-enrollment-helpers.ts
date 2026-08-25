import type {
  InternshipCourseKind,
  InternshipEnrollmentActor,
  InternshipEnrollmentLevel,
  InternshipEnrollmentRecord,
  InternshipSelectionScope,
  InternshipSupervisor,
} from '@/types/internship-enrollment';

import type { EnrollmentSnapshot } from '@/services/internship-enrollment/mock/mock-enrollment-persistence';
import { SUPERVISOR_SEEDS } from '@/services/internship-enrollment/mock/mock-enrollment-seeds';

export const PLACEHOLDER_UNSET = 'مشخص نشده';

export function capacityKey(
  termId: string,
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel,
  supervisorId: string
): string {
  return [termId, kind, level, supervisorId].join('::');
}

export function getSupervisorList(input: {
  snapshot: EnrollmentSnapshot;
  termId: string;
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
}): InternshipSupervisor[] {
  return SUPERVISOR_SEEDS.map((seed) => {
    const confirmed =
      input.snapshot.confirmedCapacity[
        capacityKey(input.termId, input.kind, input.level, seed.id)
      ] ?? 0;
    return {
      id: seed.id,
      name: seed.name,
      college: seed.college,
      province: seed.province,
      day: seed.day,
      readOnly: seed.readOnly,
      capacity:
        seed.totalCapacity === null
          ? null
          : Math.max(0, seed.totalCapacity - confirmed),
    };
  });
}

export function getScope(actor: InternshipEnrollmentActor): InternshipSelectionScope {
  const profileProvince = actor.province ?? 'تهران';
  const profileCollege = actor.college ?? 'پردیس شهید باهنر تهران';
  const canChangeScope = Boolean(actor.specialPermissions?.crossFaculty);
  const provinces = Array.from(
    new Set(SUPERVISOR_SEEDS.map((supervisor) => supervisor.province))
  );
  const collegesByProvince = Object.fromEntries(
    provinces.map((province) => [
      province,
      Array.from(
        new Set(
          SUPERVISOR_SEEDS.filter(
            (supervisor) => supervisor.province === province
          ).map((supervisor) => supervisor.college)
        )
      ),
    ])
  );

  const scopedColleges = collegesByProvince[profileProvince] ?? [];

  return {
    province: profileProvince,
    college: profileCollege,
    provinces: canChangeScope ? provinces : [profileProvince],
    colleges: canChangeScope ? scopedColleges : [profileCollege],
    collegesByProvince,
    canChangeScope,
  };
}

export function findRecord(input: {
  snapshot: EnrollmentSnapshot;
  userId: string;
  termId: string;
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
}): InternshipEnrollmentRecord | undefined {
  return input.snapshot.records.find(
    (record) =>
      record.userId === input.userId &&
      record.termId === input.termId &&
      record.kind === input.kind &&
      record.level === input.level
  );
}

export function isArchivedTerm(termTitle: string): boolean {
  return termTitle.includes('(بایگانی)') || termTitle.includes('بایگانی');
}

export function matchesDelayedSearch(name: string, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase('fa-IR');
  return (
    normalizedQuery.length === 0 ||
    name.toLocaleLowerCase('fa-IR').includes(normalizedQuery)
  );
}
