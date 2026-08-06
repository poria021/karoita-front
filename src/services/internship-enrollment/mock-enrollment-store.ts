import {
  filterEligibleSupervisors,
  hasAvailableCapacity,
  hasStudentTermEnrollmentConflict,
  findConflictingActiveTermEnrollment,
  normalizeEnrollmentCourseTitle,
} from '@/utils/enrollment-eligibility';
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
import {
  clampLevel,
  courseNameForKind,
  kindForRole,
  maxLevelForKind,
  resolveEnrollmentScenario,
} from '@/services/internship-enrollment/enrollment-mappers';
import {
  type EnrollmentSnapshot,
  type WeekReportOverride,
  readSnapshot,
  writeSnapshot,
} from '@/services/internship-enrollment/mock-enrollment-persistence';
import {
  MENTORS,
  SCHOOLS,
  SUPERVISOR_SEEDS,
} from '@/services/internship-enrollment/mock-enrollment-seeds';
import type {
  AssignDelayedSchoolMentorInput,
  EnrollWithSupervisorInput,
  GetEnrollmentPageStateInput,
  InternshipCourseKind,
  InternshipEnrollmentActor,
  InternshipEnrollmentLevel,
  InternshipEnrollmentPageState,
  InternshipEnrollmentRecord,
  InternshipEnrollmentScenario,
  InternshipEnrollmentSummary,
  InternshipMentorCapacity,
  InternshipProgressiveGrade,
  InternshipSchoolCapacity,
  InternshipSelectionScope,
  InternshipSupervisor,
  InternshipWeeklyReportFeedback,
  InternshipWeeklyReportFile,
  InternshipWeeklySession,
  InternshipWeeklySessionState,
  ListDelayedMentorsInput,
  ListDelayedSchoolsInput,
  ListEligibleSupervisorsInput,
  SaveWeeklyReportDraftInput,
  SubmitWeeklyReportInput,
} from '@/types/internship-enrollment';

export {
  clampLevel,
  courseNameForKind,
  kindForRole,
  maxLevelForKind,
  resolveEnrollmentScenario,
} from '@/services/internship-enrollment/enrollment-mappers';
export { resetEnrollmentSnapshotForTests } from '@/services/internship-enrollment/mock-enrollment-persistence';

const PLACEHOLDER_UNSET = 'مشخص نشده';
const MAX_ATTACHMENT_TOTAL_MB = 100;

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

function weekReportKey(input: {
  userId: string;
  termId: string;
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  weekId: string;
}): string {
  return `${input.userId}:${input.termId}:${input.kind}:${input.level}:${input.weekId}`;
}

function seededFeedbackForStatus(
  status: InternshipWeeklySessionState
): InternshipWeeklyReportFeedback | undefined {
  if (status !== 'needs_edit' && status !== 'approved' && status !== 'graded') {
    return undefined;
  }
  return {
    advisor:
      status === 'needs_edit'
        ? 'لطفاً بخش فعالیت کلاسی را با جزئیات بیشتری تکمیل کنید و نمونه‌کار دانش‌آموزان را ضمیمه نمایید.'
        : 'گزارش شما بررسی شد و از نظر علمی قابل قبول است.',
    mentor:
      status === 'needs_edit'
        ? 'حضور در مدرسه ثبت شده؛ توضیحات بازخورد دانش‌آموزان را کامل‌تر بنویسید.'
        : undefined,
  };
}

function seededTextForStatus(status: InternshipWeeklySessionState): string {
  if (status === 'locked_future' || status === 'overdue' || status === 'extended') {
    return '';
  }
  if (status === 'draft') return '';
  return 'گزارش نمونهٔ هفته برای نمایش وضعیت در شبیه‌ساز mock.';
}

function buildWeeklySessions(input: {
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  termId: string;
  userId: string;
}): InternshipWeeklySession[] {
  const syllabus = readSyllabusSnapshot();
  const offeringId = buildCourseOfferingId(
    input.termId,
    catalogIdForKind(input.kind, input.level)
  );
  const offering = syllabus.offerings[offeringId];
  /** After syllabus save: card count = rows of that course offering. */
  const weeks = offering
    ? offering.weeks
    : Array.from({ length: INTERNSHIP_DEFAULT_WEEKS }, (_, index) => ({
        id: `week-${index + 1}`,
        title: `هفته ${index + 1}`,
        suffix: String(index + 1),
        weight: 1,
        status: 'active' as const,
      }));

  const snapshot = readSnapshot();

  return weeks.map((week, index) => {
    const seededStatus: InternshipWeeklySessionState =
      week.status === 'archived' ? 'archived' : statusForWeek(index);
    const reportKey = weekReportKey({
      userId: input.userId,
      termId: input.termId,
      kind: input.kind,
      level: input.level,
      weekId: week.id,
    });
    const reports = snapshot.weekReports ?? {};
    const override = reportKey in reports ? reports[reportKey] : undefined;
    const status: InternshipWeeklySessionState =
      override?.status ?? seededStatus;
    const feedback = override?.feedback ?? seededFeedbackForStatus(status);
    const text = override?.text ?? seededTextForStatus(status);
    const files = override?.files ?? [];

    return {
      id: week.id,
      title: week.title || week.suffix || `هفته ${index + 1}`,
      status,
      score: status === 'graded' ? 92 : null,
      isExtended: status === 'extended' || seededStatus === 'extended',
      text,
      files,
      feedback,
    };
  });
}

function assertReportPayload(input: {
  text: string;
  files: InternshipWeeklyReportFile[];
}): void {
  const hasText = input.text.trim().length > 0;
  const hasFiles = input.files.length > 0;
  if (!hasText && !hasFiles) {
    throw new Error(
      'امکان ثبت گزارش خالی وجود ندارد. لطفاً متنی وارد کنید یا فایلی ضمیمه نمایید.'
    );
  }

  let totalMb = 0;
  for (const file of input.files) {
    if (!(file.sizeMb > 0) || file.sizeMb > 2) {
      throw new Error(
        `خطا: حجم فایل "${file.name}" فراتر از سقف مجاز ۲ مگابایت است.`
      );
    }
    totalMb += file.sizeMb;
  }
  if (totalMb > MAX_ATTACHMENT_TOTAL_MB) {
    throw new Error(
      'خطا: مجموع حجم فایل‌های ضمیمه شده از سقف مجاز ۱۰۰ مگابایت عبور می‌کند.'
    );
  }
}

function writeWeekReport(
  input: SaveWeeklyReportDraftInput,
  nextStatus: WeekReportOverride['status']
): InternshipWeeklySession {
  const kind = kindForRole(input.actor.role);
  const level = clampLevel(kind, input.level);
  assertReportPayload(input);

  const snapshot = readSnapshot();
  const record = findRecord({
    snapshot,
    userId: input.actor.id,
    termId: input.termId,
    kind,
    level,
  });
  if (!record?.supervisorId) {
    throw new Error('رکورد ثبت‌نام برای ویرایش گزارش یافت نشد.');
  }
  if (
    record.status === 'dropped' ||
    record.status === 'completed' ||
    record.removalPending
  ) {
    throw new Error('امکان ویرایش گزارش این دوره وجود ندارد.');
  }

  const key = weekReportKey({
    userId: input.actor.id,
    termId: input.termId,
    kind,
    level,
    weekId: input.weekId,
  });
  const previous = snapshot.weekReports[key];
  const files = input.files.map((file) => ({
    id: file.id,
    name: file.name,
    sizeMb: Number(file.sizeMb.toFixed(2)),
    mimeType: file.mimeType,
  }));

  writeSnapshot({
    ...snapshot,
    weekReports: {
      ...snapshot.weekReports,
      [key]: {
        text: input.text,
        files,
        status: nextStatus,
        feedback: previous?.feedback,
      },
    },
  });

  const weeks = buildWeeklySessions({
    kind,
    level,
    termId: input.termId,
    userId: input.actor.id,
  });
  const week = weeks.find((item) => item.id === input.weekId);
  if (!week) {
    throw new Error('هفتهٔ گزارش یافت نشد.');
  }
  return week;
}

export function saveWeeklyReportDraft(
  input: SaveWeeklyReportDraftInput
): InternshipWeeklySession {
  return writeWeekReport(input, 'draft');
}

export function submitWeeklyReport(
  input: SubmitWeeklyReportInput
): InternshipWeeklySession {
  return writeWeekReport(input, 'pending');
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
    weekReports: { ...snapshot.weekReports },
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
