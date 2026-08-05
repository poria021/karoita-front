import {
  isTermGateActive,
  readSyllabusSnapshot,
} from '@/services/syllabus-config/mock-syllabus-store';
import {
  buildCourseOfferingId,
  catalogIdForKind,
  isOfferingActive,
} from '@/services/syllabus-config/syllabus-mappers';
import type {
  GetEnrollmentPageStateInput,
  InternshipCourseKind,
  InternshipEnrollmentLevel,
  InternshipEnrollmentPageState,
  InternshipEnrollmentScenario,
  InternshipEnrollmentSummary,
} from '@/types/internship-enrollment';
import type { AcademicTerm, SyllabusConfigSnapshot } from '@/types/syllabus-config';

const PLACEHOLDER_UNSET = 'مشخص نشده';
/** سطح پیش‌فرض دامنه تا Phase 2 چندسطحی واقعی. */
const ACTIVE_LEVEL: InternshipEnrollmentLevel = 1;

type DemoRoleState = {
  configured: boolean;
  registered: boolean;
  supervisorName: string | null;
};

/**
 * Seed دمو تک‌صفحه‌ای (بدون تب سطح):
 * دانشجو → مهلت بسته + ثبت‌نام نشده (S2)
 * مهارت‌آموز → ثبت‌نام شده + انتظار ترم (S4)
 */
const DEMO_BY_ROLE: Record<
  GetEnrollmentPageStateInput['role'],
  DemoRoleState
> = {
  student: {
    configured: true,
    registered: false,
    supervisorName: null,
  },
  skill_learner: {
    configured: true,
    registered: true,
    supervisorName: 'مهندس رضا کریمی',
  },
};

export function kindForRole(
  role: GetEnrollmentPageStateInput['role']
): InternshipCourseKind {
  return role === 'skill_learner' ? 'apprenticeship' : 'internship';
}

export function courseNameForKind(kind: InternshipCourseKind): string {
  return kind === 'apprenticeship' ? 'کارآموزی' : 'کارورزی';
}

function pickActiveTerm(
  snapshot: SyllabusConfigSnapshot,
  kind: InternshipCourseKind
): AcademicTerm | null {
  const preferredType = kind === 'apprenticeship' ? 'modular' : 'semester';
  const preferred = snapshot.terms.filter((t) => t.type === preferredType);
  const pool = preferred.length > 0 ? preferred : snapshot.terms;
  if (pool.length === 0) return null;

  const open = pool.find(
    (t) =>
      isTermGateActive(t.isEnrollOpen, t.enrollStart) ||
      isTermGateActive(t.isTermOpen, t.termStart)
  );
  return open ?? pool[pool.length - 1] ?? null;
}

function isOfferingConfiguredInSyllabus(
  snapshot: SyllabusConfigSnapshot,
  term: AcademicTerm,
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel
): boolean {
  const catalogId = catalogIdForKind(kind, level);
  const offeringId = buildCourseOfferingId(term.id, catalogId);
  const record = snapshot.offerings[offeringId];
  if (!record) return false;
  return isOfferingActive(record.weeks);
}

export function resolveEnrollmentScenario(input: {
  syllabusConfigured: boolean;
  enrollOpen: boolean;
  termOpen: boolean;
  registered: boolean;
}): InternshipEnrollmentScenario {
  const { syllabusConfigured, enrollOpen, termOpen, registered } = input;

  if (registered && !termOpen) {
    return 'S4_registered_waiting';
  }
  if (registered && termOpen) {
    // Phase 1: ترم فعال + ثبت‌نام → هنوز کارتابل گزارش نیست؛ مثل انتظار نگه می‌داریم.
    return 'S4_registered_waiting';
  }
  if (!syllabusConfigured && !registered) {
    return 'S1_syllabus_blocked';
  }
  if (syllabusConfigured && !registered && enrollOpen) {
    return 'S3_enroll_open';
  }
  if (syllabusConfigured && !registered && (!enrollOpen || termOpen)) {
    return 'S2_enroll_closed';
  }
  return 'S1_syllabus_blocked';
}

function buildEnrollmentSummary(input: {
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  termTitle: string;
  supervisorName: string | null;
}): InternshipEnrollmentSummary {
  const courseTitle = `${courseNameForKind(input.kind)} ${input.level}`;
  return {
    supervisorName: input.supervisorName,
    attendanceDaysLabel: PLACEHOLDER_UNSET,
    schoolName: null,
    mentorName: null,
    courseTitle,
    termTitle: input.termTitle,
  };
}

/**
 * Resolve page gate state from syllabus snapshot + demo enrollment flags.
 * Single module page — no per-level tabs.
 */
export function resolveEnrollmentPageState(
  input: GetEnrollmentPageStateInput
): InternshipEnrollmentPageState {
  const kind = kindForRole(input.role);
  const level = ACTIVE_LEVEL;
  const demo = DEMO_BY_ROLE[input.role];
  const snapshot = readSyllabusSnapshot();
  const term = pickActiveTerm(snapshot, kind);
  const termTitle = term?.title ?? 'نیم‌سال جاری';

  const syllabusConfigured =
    (term
      ? isOfferingConfiguredInSyllabus(snapshot, term, kind, level)
      : false) || demo.configured;

  const enrollOpen = term
    ? isTermGateActive(term.isEnrollOpen, term.enrollStart)
    : false;
  const termOpen = term
    ? isTermGateActive(term.isTermOpen, term.termStart)
    : false;

  const scenario = resolveEnrollmentScenario({
    syllabusConfigured,
    enrollOpen,
    termOpen,
    registered: demo.registered,
  });

  const enrollment =
    scenario === 'S4_registered_waiting'
      ? buildEnrollmentSummary({
          kind,
          level,
          termTitle,
          supervisorName: demo.supervisorName,
        })
      : null;

  return {
    scenario,
    kind,
    level,
    courseName: courseNameForKind(kind),
    termTitle,
    enrollment,
  };
}
