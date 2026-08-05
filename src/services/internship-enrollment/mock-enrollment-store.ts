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

type DemoLevelState = {
  configured: boolean;
  registered: boolean;
  supervisorName: string | null;
};

/**
 * Seed دمو بر اساس زیرماژول سطح (سایدبار):
 * دانشجو: L1→S1، L2→S2، L3→S4، L4→S2
 * مهارت‌آموز: L1→S1، L2→S4
 */
const DEMO_LEVELS: Record<
  InternshipCourseKind,
  Partial<Record<InternshipEnrollmentLevel, DemoLevelState>>
> = {
  internship: {
    1: { configured: false, registered: false, supervisorName: null },
    2: { configured: true, registered: false, supervisorName: null },
    3: {
      configured: true,
      registered: true,
      supervisorName: 'دکتر سارا احمدی',
    },
    4: { configured: true, registered: false, supervisorName: null },
  },
  apprenticeship: {
    1: { configured: false, registered: false, supervisorName: null },
    2: {
      configured: true,
      registered: true,
      supervisorName: 'مهندس رضا کریمی',
    },
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

export function maxLevelForKind(kind: InternshipCourseKind): 2 | 4 {
  return kind === 'apprenticeship' ? 2 : 4;
}

export function clampLevel(
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel
): InternshipEnrollmentLevel {
  const max = maxLevelForKind(kind);
  if (level < 1) return 1;
  if (level > max) return max as InternshipEnrollmentLevel;
  return level;
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

function demoStateFor(
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel
): DemoLevelState {
  return (
    DEMO_LEVELS[kind][level] ?? {
      configured: false,
      registered: false,
      supervisorName: null,
    }
  );
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

export function resolveEnrollmentPageState(
  input: GetEnrollmentPageStateInput
): InternshipEnrollmentPageState {
  const kind = kindForRole(input.role);
  const level = clampLevel(kind, input.level);
  const demo = demoStateFor(kind, level);
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
