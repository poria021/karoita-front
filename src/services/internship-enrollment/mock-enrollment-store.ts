import { isMockApiMode } from '@/lib/api-mode';
import {
  filterEligibleSupervisors,
  hasStudentTermEnrollmentConflict,
  normalizeEnrollmentCourseTitle,
} from '@/features/karvita/internship-enrollment/lib/enrollment-eligibility';
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
  AcademicTerm,
  SyllabusConfigSnapshot,
} from '@/types/syllabus-config';
import type {
  EnrollWithSupervisorInput,
  GetEnrollmentPageStateInput,
  InternshipCourseKind,
  InternshipEnrollmentActor,
  InternshipEnrollmentLevel,
  InternshipEnrollmentPageState,
  InternshipEnrollmentRecord,
  InternshipEnrollmentRole,
  InternshipEnrollmentScenario,
  InternshipEnrollmentSummary,
  InternshipMentorCapacity,
  InternshipSchoolCapacity,
  InternshipSelectionScope,
  InternshipSupervisor,
  ListEligibleSupervisorsInput,
} from '@/types/internship-enrollment';

const STORAGE_KEY = 'karvita_mock_internship_enrollments_v1';
const PLACEHOLDER_UNSET = 'مشخص نشده';

type DemoLevelState = {
  configured: boolean;
  registered: boolean;
  supervisorName: string | null;
};

type EnrollmentSnapshot = {
  records: InternshipEnrollmentRecord[];
  confirmedCapacity: Record<string, number>;
};

type SupervisorSeed = Omit<InternshipSupervisor, 'capacity'> & {
  totalCapacity: number | null;
};

const SUPERVISOR_SEEDS: SupervisorSeed[] = [
  {
    id: 'sup-ahmadi',
    name: 'دکتر سارا احمدی',
    college: 'پردیس شهید باهنر تهران',
    province: 'تهران',
    day: 'شنبه',
    totalCapacity: 3,
  },
  {
    id: 'sup-rahimi',
    name: 'دکتر نادر رحیمی',
    college: 'پردیس شهید باهنر تهران',
    province: 'تهران',
    day: 'دوشنبه',
    totalCapacity: null,
  },
  {
    id: 'sup-farhadi',
    name: 'دکتر لیلا فرهادی',
    college: 'پردیس شهید باهنر اصفهان',
    province: 'اصفهان',
    day: 'سه‌شنبه',
    totalCapacity: 2,
  },
  {
    id: 'sup-readonly',
    name: 'دکتر مینا حیدری',
    college: 'پردیس شهید باهنر تهران',
    province: 'تهران',
    day: 'چهارشنبه',
    totalCapacity: 5,
    readOnly: true,
  },
  {
    id: 'sup-full',
    name: 'دکتر کامران حسینی',
    college: 'پردیس شهید باهنر تهران',
    province: 'تهران',
    day: 'پنج‌شنبه',
    totalCapacity: 0,
  },
];

const SCHOOLS: InternshipSchoolCapacity[] = [
  {
    id: 'school-tehran-1',
    name: 'دبیرستان ماندگار البرز',
    province: 'تهران',
    district: 'ناحیه ۱ تهران',
    capacities: { 1: 4, 2: 4, 3: 4, 4: 4 },
  },
  {
    id: 'school-tehran-2',
    name: 'مدرسه فرهنگ',
    province: 'تهران',
    district: 'ناحیه ۲ تهران',
    capacities: { 1: null, 2: null, 3: null, 4: null },
  },
  {
    id: 'school-isfahan-1',
    name: 'دبیرستان سعدی',
    province: 'اصفهان',
    district: 'ناحیه ۱ اصفهان',
    capacities: { 1: 2, 2: 2, 3: 2, 4: 2 },
  },
];

const MENTORS: InternshipMentorCapacity[] = [
  {
    id: 'mentor-tehran-1',
    name: 'آقای مرتضی ملکی',
    schoolId: 'school-tehran-1',
    capacities: { 1: 3, 2: 3, 3: 3, 4: 3 },
  },
  {
    id: 'mentor-tehran-2',
    name: 'خانم الهام جعفری',
    schoolId: 'school-tehran-2',
    capacities: { 1: null, 2: null, 3: null, 4: null },
  },
  {
    id: 'mentor-isfahan-1',
    name: 'آقای سعید نوری',
    schoolId: 'school-isfahan-1',
    capacities: { 1: 2, 2: 2, 3: 2, 4: 2 },
  },
];

/**
 * Seed دمو برای حفظ سناریوهای Phase 1 در مسیرهای سایدبار.
 * ثبت‌های Phase 2 در snapshot پایدار نوشته می‌شوند.
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

let memorySnapshot: EnrollmentSnapshot | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function emptySnapshot(): EnrollmentSnapshot {
  return { records: [], confirmedCapacity: {} };
}

function readSnapshot(): EnrollmentSnapshot {
  if (memorySnapshot) return memorySnapshot;

  if (isBrowser() && isMockApiMode()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<EnrollmentSnapshot>;
        memorySnapshot = {
          records: parsed.records ?? [],
          confirmedCapacity: parsed.confirmedCapacity ?? {},
        };
        return memorySnapshot;
      }
    } catch {
      // A damaged mock value must not prevent the enrollment route from loading.
    }
  }

  memorySnapshot = emptySnapshot();
  return memorySnapshot;
}

function writeSnapshot(snapshot: EnrollmentSnapshot): EnrollmentSnapshot {
  memorySnapshot = structuredClone(snapshot);
  if (isBrowser() && isMockApiMode()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memorySnapshot));
  }
  return memorySnapshot;
}

function pickActiveTerm(
  snapshot: SyllabusConfigSnapshot,
  kind: InternshipCourseKind
): AcademicTerm | null {
  const preferredType = kind === 'apprenticeship' ? 'modular' : 'semester';
  const preferred = snapshot.terms.filter((term) => term.type === preferredType);
  const pool = preferred.length > 0 ? preferred : snapshot.terms;
  if (pool.length === 0) return null;

  return (
    pool.find(
      (term) =>
        isTermGateActive(term.isEnrollOpen, term.enrollStart) ||
        isTermGateActive(term.isTermOpen, term.termStart)
    ) ??
    pool[pool.length - 1] ??
    null
  );
}

function isOfferingConfiguredInSyllabus(
  snapshot: SyllabusConfigSnapshot,
  term: AcademicTerm,
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel
): boolean {
  const offeringId = buildCourseOfferingId(term.id, catalogIdForKind(kind, level));
  const offering = snapshot.offerings[offeringId];
  return Boolean(offering && isOfferingActive(offering.weeks));
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

function capacityKey(
  termId: string,
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel,
  supervisorId: string
): string {
  return [termId, kind, level, supervisorId].join('::');
}

function getSupervisorList(input: {
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

function getScope(actor: InternshipEnrollmentActor): InternshipSelectionScope {
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

  const selectedProvince = canChangeScope ? profileProvince : profileProvince;
  const scopedColleges = collegesByProvince[selectedProvince] ?? [];

  return {
    province: selectedProvince,
    college: profileCollege,
    provinces: canChangeScope ? provinces : [profileProvince],
    colleges: canChangeScope ? scopedColleges : [profileCollege],
    collegesByProvince,
    canChangeScope,
  };
}

function findRecord(input: {
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

function buildEnrollmentSummary(input: {
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  termTitle: string;
  supervisorName: string | null;
  schoolName?: string | null;
  mentorName?: string | null;
}): InternshipEnrollmentSummary {
  return {
    supervisorName: input.supervisorName,
    attendanceDaysLabel: PLACEHOLDER_UNSET,
    schoolName: input.schoolName ?? null,
    mentorName: input.mentorName ?? null,
    courseTitle: normalizeEnrollmentCourseTitle(courseNameForKind(input.kind), input.level),
    termTitle: input.termTitle,
  };
}

export function kindForRole(
  role: InternshipEnrollmentRole
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

export function resolveEnrollmentScenario(input: {
  syllabusConfigured: boolean;
  enrollOpen: boolean;
  termOpen: boolean;
  registered: boolean;
}): InternshipEnrollmentScenario {
  if (input.registered) return 'S4_registered_waiting';
  if (!input.syllabusConfigured) return 'S1_syllabus_blocked';
  if (input.enrollOpen && !input.termOpen) return 'S3_enroll_open';
  return 'S2_enroll_closed';
}

export function resolveEnrollmentPageState(
  input: GetEnrollmentPageStateInput
): InternshipEnrollmentPageState {
  const kind = kindForRole(input.actor.role);
  const level = clampLevel(kind, input.level);
  const demo = demoStateFor(kind, level);
  const syllabus = readSyllabusSnapshot();
  const term = pickActiveTerm(syllabus, kind);
  const termId = term?.id ?? `mock-term-${kind}`;
  const termTitle = term?.title ?? 'نیم‌سال جاری';
  const snapshot = readSnapshot();
  const record = findRecord({
    snapshot,
    userId: input.actor.id,
    termId,
    kind,
    level,
  });
  const configured =
    (term ? isOfferingConfiguredInSyllabus(syllabus, term, kind, level) : false) ||
    demo.configured;
  const enrollOpen = term
    ? isTermGateActive(term.isEnrollOpen, term.enrollStart)
    : false;
  const termOpen = term ? isTermGateActive(term.isTermOpen, term.termStart) : false;
  const registered = Boolean(record?.supervisorId) || demo.registered;
  const scenario = resolveEnrollmentScenario({
    syllabusConfigured: configured,
    enrollOpen,
    termOpen,
    registered,
  });

  return {
    scenario,
    kind,
    level,
    courseName: courseNameForKind(kind),
    termTitle,
    termId,
    enrollment:
      scenario === 'S4_registered_waiting'
        ? buildEnrollmentSummary({
            kind,
            level,
            termTitle,
            supervisorName: record?.supervisorName ?? demo.supervisorName,
            schoolName: record?.schoolName,
            mentorName: record?.mentorName,
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

  const term = pickActiveTerm(readSyllabusSnapshot(), input.kind);
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

export function enrollWithSupervisor(
  input: EnrollWithSupervisorInput
): InternshipEnrollmentRecord {
  const kind = input.kind;
  const level = clampLevel(kind, input.level);
  const syllabus = readSyllabusSnapshot();
  const term = pickActiveTerm(syllabus, kind);
  const termId = term?.id ?? `mock-term-${kind}`;

  if (termId !== input.termId) {
    throw new Error('ترم انتخاب واحد تغییر کرده است. لطفاً دوباره تلاش کنید.');
  }

  const snapshot = readSnapshot();
  if (
    hasStudentTermEnrollmentConflict({
      records: snapshot.records,
      actor: input.actor,
      kind,
      level,
      termId,
    })
  ) {
    throw new Error(
      'شما در این نیم‌سال تحصیلی مجاز به اخذ بیش از یک درس کارورزی نیستید.'
    );
  }

  if (!input.actor.approved) {
    throw new Error('حساب شما فعال نیست.');
  }

  if (input.actor.specialPermissions?.readOnly) {
    throw new Error(
      'حساب شما در حالت فقط‌خواندنی قرار دارد و امکان اخذ واحد ندارید.'
    );
  }

  const supervisor = getSupervisorList({
    snapshot,
    termId,
    kind,
    level,
  }).find((item) => item.id === input.supervisorId);

  if (!supervisor) throw new Error('استاد راهنمای انتخاب‌شده در دسترس نیست.');

  const scope = getScope(input.actor);
  const eligible = filterEligibleSupervisors({
    supervisors: [supervisor],
    actor: input.actor,
    level,
    query: '',
    province: input.actor.specialPermissions?.crossFaculty
      ? supervisor.province
      : scope.province,
    college: input.actor.specialPermissions?.crossFaculty
      ? supervisor.college
      : scope.college,
    schools: SCHOOLS,
    mentors: MENTORS,
  });

  if (eligible.length === 0) {
    throw new Error('ظرفیت مجاز برای این استاد راهنما در دسترس نیست.');
  }

  const existing = findRecord({
    snapshot,
    userId: input.actor.id,
    termId,
    kind,
    level,
  });
  const record: InternshipEnrollmentRecord = {
    id: existing?.id ?? `enr_${input.actor.id}_${termId}_${kind}_${level}`,
    userId: input.actor.id,
    role: input.actor.role,
    kind,
    level,
    termId,
    termTitle: term?.title ?? 'نیم‌سال جاری',
    title: normalizeEnrollmentCourseTitle(courseNameForKind(kind), level),
    supervisorId: supervisor.id,
    supervisorName: supervisor.name,
    schoolName: null,
    mentorName: null,
  };

  const next: EnrollmentSnapshot = {
    records: [
      ...snapshot.records.filter((item) => item.id !== record.id),
      record,
    ],
    confirmedCapacity: { ...snapshot.confirmedCapacity },
  };
  const key = capacityKey(termId, kind, level, supervisor.id);
  next.confirmedCapacity[key] = (next.confirmedCapacity[key] ?? 0) + 1;
  writeSnapshot(next);
  return record;
}
