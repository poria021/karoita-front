import { isMockApiMode } from '@/lib/api-mode';
import {
  filterEligibleSupervisors,
  hasAvailableCapacity,
  hasStudentTermEnrollmentConflict,
  normalizeEnrollmentCourseTitle,
} from '@/features/karvita/internship-enrollment/lib/enrollment-eligibility';
import {
  INTERNSHIP_DEFAULT_WEEKS,
  readSyllabusSnapshot,
} from '@/services/syllabus-config/mock-syllabus-store';
import {
  pickActiveTermForKind,
  resolveEnrollmentSyllabusContext,
} from '@/services/syllabus-config/syllabus-enrollment-reads';
import {
  buildCourseOfferingId,
  catalogIdForKind,
} from '@/services/syllabus-config/syllabus-mappers';
import type {
  AssignDelayedSchoolMentorInput,
  EnrollWithSupervisorInput,
  GetEnrollmentPageStateInput,
  InternshipCourseKind,
  InternshipEnrollmentActor,
  InternshipEnrollmentLevel,
  InternshipEnrollmentPageState,
  InternshipEnrollmentRecord,
  InternshipEnrollmentRecordStatus,
  InternshipEnrollmentRole,
  InternshipEnrollmentScenario,
  InternshipEnrollmentSummary,
  InternshipMentorCapacity,
  InternshipProgressiveGrade,
  InternshipSchoolCapacity,
  InternshipSelectionScope,
  InternshipSupervisor,
  InternshipWeeklySession,
  InternshipWeeklySessionState,
  ListDelayedMentorsInput,
  ListDelayedSchoolsInput,
  ListEligibleSupervisorsInput,
} from '@/types/internship-enrollment';

const STORAGE_KEY = 'karvita_mock_internship_enrollments_v1';
const PLACEHOLDER_UNSET = 'مشخص نشده';

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

/** Test helper — replace or clear enrollment mock persistence. */
export function resetEnrollmentSnapshotForTests(
  snapshot?: EnrollmentSnapshot | null
): void {
  memorySnapshot = snapshot ? structuredClone(snapshot) : null;
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

function statusForWeek(index: number): InternshipWeeklySessionState {
  const seededStates: InternshipWeeklySessionState[] = [
    'graded',
    'approved',
    'pending',
    'needs_edit',
    'extended',
    'overdue',
  ];
  return seededStates[index] ?? 'locked_future';
}

function buildWeeklySessions(input: {
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  termId: string;
}): InternshipWeeklySession[] {
  const syllabus = readSyllabusSnapshot();
  const offeringId = buildCourseOfferingId(
    input.termId,
    catalogIdForKind(input.kind, input.level)
  );
  const syllabusWeeks = syllabus.offerings[offeringId]?.weeks ?? [];
  const weeks =
    syllabusWeeks.length > 0
      ? syllabusWeeks
      : Array.from({ length: INTERNSHIP_DEFAULT_WEEKS }, (_, index) => ({
          id: `week-${index + 1}`,
          title: `هفته ${index + 1}`,
          suffix: String(index + 1),
          weight: 1,
          status: 'active' as const,
        }));

  return weeks.map((week, index) => {
    const status: InternshipWeeklySessionState =
      week.status === 'archived' ? 'archived' : statusForWeek(index);
    return {
      id: week.id,
      title: week.title || week.suffix || `هفته ${index + 1}`,
      status,
      score: status === 'graded' ? 92 : null,
      isExtended: status === 'extended',
    };
  });
}

function buildProgressiveGrade(
  weeks: InternshipWeeklySession[]
): InternshipProgressiveGrade {
  const scoredWeeks = weeks.filter(
    (week) => week.status === 'graded' && week.score !== null
  );
  if (scoredWeeks.length === 0) {
    return { gradedCount: 0, final20: null };
  }

  const average =
    scoredWeeks.reduce((sum, week) => sum + (week.score ?? 0), 0) /
    scoredWeeks.length;
  return {
    gradedCount: scoredWeeks.length,
    final20: Number(((average / 100) * 20).toFixed(2)),
  };
}

function isArchivedTerm(termTitle: string): boolean {
  return termTitle.includes('(بایگانی)') || termTitle.includes('بایگانی');
}

function buildEnrollmentSummary(input: {
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  termTitle: string;
  supervisorName: string | null;
  record: InternshipEnrollmentRecord | undefined;
  weeks: InternshipWeeklySession[];
}): InternshipEnrollmentSummary {
  const record = input.record;
  return {
    supervisorName: input.supervisorName,
    attendanceDaysLabel: record?.attendanceDaysLabel ?? PLACEHOLDER_UNSET,
    schoolId: record?.schoolId ?? null,
    schoolName: record?.schoolName ?? null,
    mentorId: record?.mentorId ?? null,
    mentorName: record?.mentorName ?? null,
    courseTitle: normalizeEnrollmentCourseTitle(
      courseNameForKind(input.kind),
      input.level
    ),
    termTitle: input.termTitle,
    status: record?.status ?? 'active',
    removalPending: Boolean(record?.removalPending),
    isTermArchived: isArchivedTerm(input.termTitle),
    weeks: input.weeks,
    progressiveGrade: buildProgressiveGrade(input.weeks),
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
  status?: InternshipEnrollmentRecordStatus;
  removalPending?: boolean;
  termArchived?: boolean;
}): InternshipEnrollmentScenario {
  if (
    input.registered &&
    (input.termOpen ||
      input.status === 'dropped' ||
      input.status === 'completed' ||
      input.removalPending ||
      input.termArchived)
  ) {
    return 'S5_term_active';
  }
  if (input.registered) return 'S4_registered_waiting';
  if (!input.syllabusConfigured) return 'S1_syllabus_blocked';
  // انتخاب واحد و برگزاری ترم مستقل‌اند؛ termOpen فقط مسیر بعد از ثبت‌نام را عوض می‌کند.
  if (input.enrollOpen) return 'S3_enroll_open';
  return 'S2_enroll_closed';
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
  });
  const scenario = resolveEnrollmentScenario({
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

function matchesDelayedSearch(name: string, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase('fa-IR');
  return (
    normalizedQuery.length === 0 ||
    name.toLocaleLowerCase('fa-IR').includes(normalizedQuery)
  );
}

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

export function enrollWithSupervisor(
  input: EnrollWithSupervisorInput
): InternshipEnrollmentRecord {
  const kind = input.kind;
  const level = clampLevel(kind, input.level);
  const syllabus = readSyllabusSnapshot();
  const context = resolveEnrollmentSyllabusContext(syllabus, kind, level);
  const termId = context.termId;

  if (termId !== input.termId) {
    throw new Error('ترم انتخاب واحد تغییر کرده است. لطفاً دوباره تلاش کنید.');
  }

  if (!context.syllabusConfigured) {
    throw new Error('سرفصل این درس هنوز برای ترم جاری فعال نشده است.');
  }

  if (!context.enrollOpen) {
    throw new Error('درگاه انتخاب واحد برای این ترم فعال نیست.');
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
    termTitle: context.termTitle,
    title: normalizeEnrollmentCourseTitle(courseNameForKind(kind), level),
    supervisorId: supervisor.id,
    supervisorName: supervisor.name,
    schoolId: null,
    schoolName: null,
    mentorId: null,
    mentorName: null,
    attendanceDaysLabel: PLACEHOLDER_UNSET,
    status: 'active',
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

export function assignDelayedSchoolMentor(
  input: AssignDelayedSchoolMentorInput
): InternshipEnrollmentRecord {
  const kind = input.kind;
  const level = clampLevel(kind, input.level);
  const context = resolveEnrollmentSyllabusContext(
    readSyllabusSnapshot(),
    kind,
    level
  );
  if (context.termId !== input.termId) {
    throw new Error('ترم انتخاب واحد تغییر کرده است. لطفاً دوباره تلاش کنید.');
  }
  if (!input.actor.approved) {
    throw new Error('حساب شما فعال نیست.');
  }
  if (input.actor.specialPermissions?.readOnly) {
    throw new Error(
      'حساب شما در حالت فقط‌خواندنی قرار دارد و امکان تخصیص مدرسه ندارید.'
    );
  }

  const snapshot = readSnapshot();
  const record = findRecord({
    snapshot,
    userId: input.actor.id,
    termId: input.termId,
    kind,
    level,
  });
  if (!record?.supervisorId) {
    throw new Error('رکورد ثبت‌نام برای تخصیص مدرسه یافت نشد.');
  }
  if (record.status === 'dropped' || record.removalPending) {
    throw new Error('امکان تغییر تخصیص این دوره وجود ندارد.');
  }

  const school = listDelayedSchools({
    actor: input.actor,
    level,
    query: '',
  }).find((item) => item.id === input.schoolId);
  if (!school) {
    throw new Error('مدرسه انتخاب‌شده در دسترس نیست.');
  }

  const mentor = listDelayedMentors({
    actor: input.actor,
    level,
    schoolId: school.id,
    query: '',
  }).find((item) => item.id === input.mentorId);
  if (!mentor) {
    throw new Error('معلم ناظر انتخاب‌شده در دسترس نیست.');
  }

  const supervisorDay =
    SUPERVISOR_SEEDS.find((item) => item.id === record.supervisorId)?.day ??
    PLACEHOLDER_UNSET;
  const updatedRecord: InternshipEnrollmentRecord = {
    ...record,
    schoolId: school.id,
    schoolName: school.name,
    mentorId: mentor.id,
    mentorName: mentor.name,
    attendanceDaysLabel: supervisorDay,
  };
  writeSnapshot({
    ...snapshot,
    records: snapshot.records.map((item) =>
      item.id === updatedRecord.id ? updatedRecord : item
    ),
  });
  return updatedRecord;
}
