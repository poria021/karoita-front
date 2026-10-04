import {
  clampLevel,
  courseNameForKind,
  kindForRole,
  resolveEnrollmentScenario,
} from '@/services/internship-enrollment/enrollment-mappers';
import {
  MENTORS,
  SCHOOLS,
  SUPERVISOR_SEEDS,
} from '@/services/internship-enrollment/mock/enrollment.seeds';
import {
  courseDefinitionsOf,
  findLeafByEnrollmentLevel,
  isDynamicEnrollmentLevel,
  leafIdForEnrollmentLevel,
} from '@/services/syllabus-config/course-catalog';
import { resolveEnrollmentSyllabusContext } from '@/services/syllabus-config/syllabus-enrollment-reads';
import { mockSyllabusSnapshot } from '@/services/syllabus-config/mock/syllabus.fixtures';
import type {
  AssignDelayedSchoolMentorInput,
  EnrollWithSupervisorInput,
  GetEnrollmentPageStateInput,
  InternshipCourseKind,
  InternshipEnrollmentLevel,
  InternshipEnrollmentPageState,
  InternshipEnrollmentRecord,
  InternshipMentorCapacity,
  InternshipSchoolCapacity,
  InternshipSelectionScope,
  InternshipSupervisor,
  InternshipWeeklySession,
  SaveWeeklyReportDraftInput,
} from '@/types/internship-enrollment';
import { normalizeEnrollmentCourseTitle } from '@/utils/enrollment-eligibility';

/**
 * داده‌ی ثابت حالت mock — هیچ state یا ذخیره‌سازی‌ای ندارد؛ ثبت‌نام/گزارش هفتگی
 * فقط نتیجه را برمی‌گرداند و بین صفحات چیزی نمی‌ماند.
 */

function firstOf(value: string[] | string | undefined, fallback: string): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value || fallback;
}

function courseTitleForLevel(
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel
): string {
  if (isDynamicEnrollmentLevel(level)) {
    const leaf = findLeafByEnrollmentLevel(
      courseDefinitionsOf(mockSyllabusSnapshot()),
      kind === 'apprenticeship' ? 'modular' : 'semester',
      level
    );
    if (leaf) return leaf.title;
  }
  return normalizeEnrollmentCourseTitle(courseNameForKind(kind), level);
}

function scopeFor(
  actor: GetEnrollmentPageStateInput['actor']
): InternshipSelectionScope {
  const province = firstOf(actor.province, 'تهران');
  const college = firstOf(actor.college, 'پردیس شهید باهنر تهران');
  const canChangeScope = Boolean(actor.specialPermissions?.crossFaculty);
  const provinces = Array.from(new Set(SUPERVISOR_SEEDS.map((s) => s.province)));
  const collegesByProvince = Object.fromEntries(
    provinces.map((p) => [
      p,
      Array.from(
        new Set(
          SUPERVISOR_SEEDS.filter((s) => s.province === p).map((s) => s.college)
        )
      ),
    ])
  );
  return {
    province,
    college,
    provinces: canChangeScope ? provinces : [province],
    colleges: canChangeScope ? (collegesByProvince[province] ?? []) : [college],
    collegesByProvince,
    canChangeScope,
  };
}

export function mockEnrollmentPageState(
  input: GetEnrollmentPageStateInput
): InternshipEnrollmentPageState {
  const kind = kindForRole(input.actor.role);
  const level = clampLevel(kind, input.level);
  const syllabus = mockSyllabusSnapshot();
  const context = resolveEnrollmentSyllabusContext(syllabus, kind, level);
  const scenario = resolveEnrollmentScenario({
    syllabusConfigured: context.syllabusConfigured,
    enrollOpen: context.enrollOpen,
    termOpen: context.termOpen,
    registered: false,
  });

  return {
    scenario,
    kind,
    level,
    courseName: courseNameForKind(kind),
    courseTitle: courseTitleForLevel(kind, level),
    termTitle: context.termTitle,
    termId: context.termId,
    lessonId: leafIdForEnrollmentLevel(
      courseDefinitionsOf(syllabus),
      kind,
      level
    ),
    enrollment: null,
    termHistory: [],
    selection: {
      scope: scopeFor(input.actor),
      wasDropped: false,
      droppedSupervisorName: null,
    },
    conflictEnrollment: null,
  };
}

export function mockSupervisors(): InternshipSupervisor[] {
  return SUPERVISOR_SEEDS.map(({ totalCapacity, ...rest }) => ({
    ...rest,
    capacity: totalCapacity,
  }));
}

export function mockSchools(): InternshipSchoolCapacity[] {
  return SCHOOLS.map((school) => ({ ...school }));
}

export function mockMentors(schoolId: string): InternshipMentorCapacity[] {
  return MENTORS.filter((mentor) => mentor.schoolId === schoolId).map(
    (mentor) => ({ ...mentor })
  );
}

/** ثبت‌نام/تخصیص مدرسه و معلم — فقط رکورد نتیجه برمی‌گردد و ذخیره نمی‌شود. */
export function mockEnrollmentRecord(
  input: EnrollWithSupervisorInput | AssignDelayedSchoolMentorInput
): InternshipEnrollmentRecord {
  const supervisorId =
    'supervisorId' in input ? input.supervisorId : null;
  const schoolId = 'schoolId' in input ? input.schoolId : null;
  const mentorId = 'mentorId' in input ? input.mentorId : null;
  const supervisor = SUPERVISOR_SEEDS.find((s) => s.id === supervisorId);
  const school = SCHOOLS.find((s) => s.id === schoolId);
  const mentor = MENTORS.find((m) => m.id === mentorId);
  const context = resolveEnrollmentSyllabusContext(
    mockSyllabusSnapshot(),
    input.kind,
    input.level
  );

  return {
    id: `enr-${input.actor.id}-${input.termId}-${input.level}`,
    userId: input.actor.id,
    role: input.actor.role,
    kind: input.kind,
    level: input.level,
    termId: input.termId,
    termTitle: context.termTitle,
    title: courseTitleForLevel(input.kind, input.level),
    supervisorId,
    supervisorName: supervisor?.name ?? null,
    schoolId,
    schoolName: school?.name ?? null,
    mentorId,
    mentorName: mentor?.name ?? null,
    attendanceDaysLabel: supervisor?.days.join('، '),
    status: 'active',
  };
}

export function mockWeeklySession(
  input: SaveWeeklyReportDraftInput,
  status: Extract<InternshipWeeklySession['status'], 'draft' | 'pending'>
): InternshipWeeklySession {
  return {
    id: input.weekId,
    title: input.weekId,
    status,
    score: null,
    text: input.text,
    files: input.files,
    reportSubmittedAt: status === 'pending' ? new Date().toISOString() : null,
  };
}
