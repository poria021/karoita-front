import {
  clampLevel,
  courseNameForKind,
  kindForRole,
  resolveEnrollmentScenario,
} from '@/services/internship-enrollment/enrollment-mappers';
import {
  courseTitleForLevel,
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
  courseDefinitionsOf,
  leafIdForEnrollmentLevel,
} from '@/services/syllabus-config/course-catalog';
import {
  pickActiveTermForKind,
  resolveEnrollmentSyllabusContext,
} from '@/services/syllabus-config/syllabus-enrollment-reads';
import { resolveEffectiveEnrollmentEntry } from '@/services/internship-enrollment/real/mappers/enrollment-page-state';
import type {
  GetEnrollmentPageStateInput,
  GetEnrollmentTermReportInput,
  InternshipCourseKind,
  InternshipEnrollmentActor,
  InternshipEnrollmentLevel,
  InternshipEnrollmentPageState,
  InternshipEnrollmentRecord,
  InternshipEnrollmentScenario,
  InternshipEnrollmentSummary,
  InternshipMentorCapacity,
  InternshipSchoolCapacity,
  InternshipSupervisor,
  ListDelayedMentorsInput,
  ListDelayedSchoolsInput,
  ListEligibleSupervisorsInput,
} from '@/types/internship-enrollment';
import {
  capacityForLevel,
  filterEligibleSupervisors,
  findConflictingActiveTermEnrollment,
  hasAvailableCapacity,
} from '@/utils/enrollment-eligibility';

/**
 * آیا مدرسه در scope بازیگر است.
 * `province` و `district` آرایه‌اند — همهٔ مقادیر بررسی می‌شوند.
 */
function isSchoolInActorScope(
  school: InternshipSchoolCapacity,
  actor: InternshipEnrollmentActor
): boolean {
  if (actor.specialPermissions?.crossFaculty) return true;

  const actorProvinces = Array.isArray(actor.province)
    ? actor.province
    : actor.province
    ? [actor.province]
    : ['تهران'];

  if (!actorProvinces.includes(school.province)) return false;

  // اگر بازیگر منطقه ندارد، هر مدرسه‌ای قابل قبول است
  if (!actor.district || (Array.isArray(actor.district) && actor.district.length === 0)) {
    return true;
  }

  const actorDistricts = Array.isArray(actor.district)
    ? actor.district
    : [actor.district];

  return actorDistricts.includes(school.district);
}

type MockHistoryEntry = {
  semesterId: string;
  enrolment: { status: string; createdAt: null };
  record: InternshipEnrollmentRecord;
};

/**
 * معادل `findEnrolmentHistoryForLevel` در حالت real: همهٔ ثبت‌نام‌های غیرلغوشدهٔ
 * این کاربر در همین kind/level در همهٔ ترم‌ها، نه فقط ترم فعال. جدیدترین اول
 * (mock `createdAt` ندارد، ترتیب درج معیار است).
 */
function findMockEnrolmentHistory(input: {
  records: InternshipEnrollmentRecord[];
  userId: string;
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
}): MockHistoryEntry[] {
  return input.records
    .filter(
      (record) =>
        record.userId === input.userId &&
        record.kind === input.kind &&
        record.level === input.level &&
        Boolean(record.supervisorId) &&
        record.status !== 'dropped'
    )
    .map((record) => ({
      semesterId: record.termId,
      enrolment: { status: record.status ?? 'active', createdAt: null },
      record,
    }))
    .reverse();
}

export function resolveEnrollmentPageState(
  input: GetEnrollmentPageStateInput
): InternshipEnrollmentPageState {
  const kind = kindForRole(input.actor.role);
  const level = clampLevel(kind, input.level);
  const syllabus = readSyllabusSnapshot();
  const context = resolveEnrollmentSyllabusContext(syllabus, kind, level);
  const snapshot = readSnapshot();

  // همان منطق real: ثبت‌نام «فعلی» از تاریخچهٔ همهٔ ترم‌ها تعیین می‌شود؛
  // `active` مانده از ترم قبل جلوی انتخاب واحد ترم جدید را نمی‌گیرد.
  const history = findMockEnrolmentHistory({
    records: snapshot.records,
    userId: input.actor.id,
    kind,
    level,
  });
  const current = context.syllabusConfigured ? {} : null;
  const effectiveEntry = resolveEffectiveEnrollmentEntry(
    current,
    history,
    context.termId
  );
  const record =
    effectiveEntry?.record ??
    findRecord({
      snapshot,
      userId: input.actor.id,
      termId: context.termId,
      kind,
      level,
    });
  const registered = Boolean(effectiveEntry);
  const isActiveInOpenTerm = effectiveEntry?.semesterId === context.termId;
  const activeTermId = effectiveEntry ? effectiveEntry.semesterId : context.termId;
  const activeTermTitle = effectiveEntry
    ? isActiveInOpenTerm
      ? context.termTitle
      : (effectiveEntry.record.termTitle || context.termTitle)
    : context.termTitle;
  // ترم غیرِ باز یعنی کلاس‌هایش قطعاً شروع شده (مثل real).
  const activeTermOpen = effectiveEntry
    ? isActiveInOpenTerm
      ? context.termOpen
      : true
    : false;
  const weeks = buildWeeklySessions({
    kind,
    level,
    termId: activeTermId,
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
        syllabusConfigured: registered || context.syllabusConfigured,
        enrollOpen: context.enrollOpen,
        termOpen: activeTermOpen,
        registered,
        status: effectiveEntry?.record.status,
        removalPending: effectiveEntry?.record.removalPending,
        termArchived: isArchivedTerm(activeTermTitle),
      });

  return {
    scenario,
    kind,
    level,
    courseName: courseNameForKind(kind),
    courseTitle: courseTitleForLevel(kind, level),
    termTitle: activeTermTitle,
    termId: activeTermId,
    lessonId: leafIdForEnrollmentLevel(courseDefinitionsOf(syllabus), kind, level),
    enrollment:
      scenario === 'S4_registered_waiting' || scenario === 'S5_term_active'
        ? buildEnrollmentSummary({
            kind,
            level,
            termTitle: activeTermTitle,
            supervisorName: effectiveEntry?.record.supervisorName ?? null,
            record: effectiveEntry?.record,
            weeks,
          })
        : null,
    termHistory: history.map((entry) => ({
      termId: entry.semesterId,
      termTitle:
        entry.semesterId === context.termId
          ? context.termTitle
          : entry.record.termTitle,
      status: entry.record.status ?? 'active',
    })),
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

/**
 * گزارش یک نیم‌سالِ مشخص از تاریخچهٔ این level (مثل real) — برای سلکت‌باکس
 * نیم‌سال‌های قبلی؛ ترمی که ثبت‌نامی در آن نیست `null` می‌دهد.
 */
export function resolveEnrollmentTermReport(
  input: GetEnrollmentTermReportInput
): InternshipEnrollmentSummary | null {
  const kind = kindForRole(input.actor.role);
  const level = clampLevel(kind, input.level);
  const entry = findMockEnrolmentHistory({
    records: readSnapshot().records,
    userId: input.actor.id,
    kind,
    level,
  }).find((item) => item.semesterId === input.termId);
  if (!entry) return null;
  return buildEnrollmentSummary({
    kind,
    level,
    termTitle: entry.record.termTitle,
    supervisorName: entry.record.supervisorName,
    record: entry.record,
    weeks: buildWeeklySessions({
      kind,
      level,
      termId: entry.semesterId,
      userId: input.actor.id,
    }),
  });
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
      hasAvailableCapacity(capacityForLevel(school.capacities, input.level)) &&
      matchesDelayedSearch(school.name, input.query) &&
      MENTORS.some(
        (mentor) =>
          mentor.schoolId === school.id &&
          hasAvailableCapacity(capacityForLevel(mentor.capacities, input.level))
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
    !hasAvailableCapacity(capacityForLevel(school.capacities, input.level))
  ) {
    return [];
  }

  return MENTORS.filter(
    (mentor) =>
      mentor.schoolId === school.id &&
      hasAvailableCapacity(capacityForLevel(mentor.capacities, input.level)) &&
      matchesDelayedSearch(mentor.name, input.query)
  );
}
