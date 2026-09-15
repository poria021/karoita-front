import { clampLevel, courseNameForKind } from '@/services/internship-enrollment/enrollment-mappers';
import {
  capacityKey,
  findRecord,
  getScope,
  getSupervisorList,
  PLACEHOLDER_UNSET,
} from '@/services/internship-enrollment/mock/mock-enrollment-helpers';
import {
  type EnrollmentSnapshot,
  readSnapshot,
  writeSnapshot,
} from '@/services/internship-enrollment/mock/mock-enrollment-persistence';
import {
  listDelayedMentors,
  listDelayedSchools,
} from '@/services/internship-enrollment/mock/mock-enrollment-reads';
import {
  MENTORS,
  SCHOOLS,
  SUPERVISOR_SEEDS,
} from '@/services/internship-enrollment/mock/mock-enrollment-seeds';
import { readSyllabusSnapshot } from '@/services/syllabus-config/mock/mock-syllabus-store';
import { resolveEnrollmentSyllabusContext } from '@/services/syllabus-config/syllabus-enrollment-reads';
import type {
  AssignDelayedSchoolMentorInput,
  EnrollWithSupervisorInput,
  InternshipEnrollmentRecord,
} from '@/types/internship-enrollment';
import {
  filterEligibleSupervisors,
  hasStudentTermEnrollmentConflict,
  normalizeEnrollmentCourseTitle,
} from '@/utils/enrollment-eligibility';

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

  const supervisorSeed = SUPERVISOR_SEEDS.find((item) => item.id === record.supervisorId);
  const supervisorDay = supervisorSeed?.days.length
    ? supervisorSeed.days.join('، ')
    : PLACEHOLDER_UNSET;
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
