import {
  clampLevel,
  courseNameForKind,
  kindForRole,
  resolveEnrollmentScenario,
} from '@/services/internship-enrollment/enrollment-mappers';
import {
  findRecord,
  getScope,
  getSupervisorList,
  isArchivedTerm,
  matchesDelayedSearch,
} from '@/services/internship-enrollment/mock/mock-enrollment-helpers';
import { readSnapshot } from '@/services/internship-enrollment/mock/mock-enrollment-persistence';
import {
  MENTORS,
  SCHOOLS,
} from '@/services/internship-enrollment/mock/mock-enrollment-seeds';
import {
  buildEnrollmentSummary,
  buildWeeklySessions,
} from '@/services/internship-enrollment/mock/mock-enrollment-weekly';
import { readSyllabusSnapshot } from '@/services/syllabus-config/mock/mock-syllabus-store';
import {
  pickActiveTermForKind,
  resolveEnrollmentSyllabusContext,
} from '@/services/syllabus-config/syllabus-enrollment-reads';
import type {
  GetEnrollmentPageStateInput,
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
  InternshipEnrollmentScenario,
  InternshipMentorCapacity,
  InternshipSchoolCapacity,
  InternshipSupervisor,
  ListDelayedMentorsInput,
  ListDelayedSchoolsInput,
  ListEligibleSupervisorsInput,
} from '@/types/internship-enrollment';
import {
  filterEligibleSupervisors,
  findConflictingActiveTermEnrollment,
  hasAvailableCapacity,
} from '@/utils/enrollment-eligibility';

function isSchoolInActorScope(
  school: InternshipSchoolCapacity,
  actor: InternshipEnrollmentActor
): boolean {
  if (actor.specialPermissions?.crossFaculty) return true;
  return (
    school.province === (actor.province ?? 'تهران') &&
    (!actor.district || school.district === actor.district)
  );
}

export function resolveEnrollmentPageState(
  input: GetEnrollmentPageStateInput
): InternshipEnrollmentPageState {
  const kind = kindForRole(input.actor.role);
  const level = clampLevel(kind, input.level);
  const syllabus = readSyllabusSnapshot();
  const context = resolveEnrollmentSyllabusContext(syllabus, kind, level);
  const snapshot = readSnapshot();
  const record = findRecord({
    snapshot,
    userId: input.actor.id,
    termId: context.termId,
    kind,
    level,
  });
  const registered = Boolean(record?.supervisorId);
  const weeks = buildWeeklySessions({
    kind,
    level,
    termId: context.termId,
    userId: input.actor.id,
  });
  const conflictRecord = !registered
    ? findConflictingActiveTermEnrollment({
        records: snapshot.records,
        actor: input.actor,
        kind,
        level,
        termId: context.termId,
      })
    : null;
  const scenario: InternshipEnrollmentScenario = conflictRecord
    ? 'S6_already_enrolled_elsewhere'
    : resolveEnrollmentScenario({
        syllabusConfigured: context.syllabusConfigured,
        enrollOpen: context.enrollOpen,
        termOpen: context.termOpen,
        registered,
        status: record?.status,
        removalPending: record?.removalPending,
        termArchived: isArchivedTerm(context.termTitle),
      });

  return {
    scenario,
    kind,
    level,
    courseName: courseNameForKind(kind),
    termTitle: context.termTitle,
    termId: context.termId,
    enrollment:
      scenario === 'S4_registered_waiting' || scenario === 'S5_term_active'
        ? buildEnrollmentSummary({
            kind,
            level,
            termTitle: context.termTitle,
            supervisorName: record?.supervisorName ?? null,
            record,
            weeks,
          })
        : null,
    selection:
      scenario === 'S3_enroll_open'
        ? {
            scope: getScope(input.actor),
            wasDropped: Boolean(record?.wasDropped),
            droppedSupervisorName: record?.droppedSupervisorName ?? null,
          }
        : null,
    conflictEnrollment: conflictRecord
      ? {
          level: conflictRecord.level,
          courseTitle: conflictRecord.title,
        }
      : null,
  };
}

export function listEligibleSupervisors(
  input: ListEligibleSupervisorsInput
): InternshipSupervisor[] {
  const snapshot = readSnapshot();
  const scope = getScope(input.actor);
  const selectedProvince = input.province || scope.province;
  const selectedCollege = input.college || scope.college;

  if (
    !scope.canChangeScope &&
    (selectedProvince !== scope.province || selectedCollege !== scope.college)
  ) {
    return [];
  }

  const term = pickActiveTermForKind(readSyllabusSnapshot(), input.kind);
  return filterEligibleSupervisors({
    supervisors: getSupervisorList({
      snapshot,
      termId: term?.id ?? `mock-term-${input.kind}`,
      kind: input.kind,
      level: input.level,
    }),
    actor: input.actor,
    level: input.level,
    query: input.query,
    province: selectedProvince,
    college: selectedCollege,
    schools: SCHOOLS,
    mentors: MENTORS,
  });
}

export function listDelayedSchools(
  input: ListDelayedSchoolsInput
): InternshipSchoolCapacity[] {
  return SCHOOLS.filter(
    (school) =>
      isSchoolInActorScope(school, input.actor) &&
      hasAvailableCapacity(school.capacities[input.level]) &&
      matchesDelayedSearch(school.name, input.query) &&
      MENTORS.some(
        (mentor) =>
          mentor.schoolId === school.id &&
          hasAvailableCapacity(mentor.capacities[input.level])
      )
  );
}

export function listDelayedMentors(
  input: ListDelayedMentorsInput
): InternshipMentorCapacity[] {
  const school = SCHOOLS.find((item) => item.id === input.schoolId);
  if (
    !school ||
    !isSchoolInActorScope(school, input.actor) ||
    !hasAvailableCapacity(school.capacities[input.level])
  ) {
    return [];
  }

  return MENTORS.filter(
    (mentor) =>
      mentor.schoolId === school.id &&
      hasAvailableCapacity(mentor.capacities[input.level]) &&
      matchesDelayedSearch(mentor.name, input.query)
  );
}
