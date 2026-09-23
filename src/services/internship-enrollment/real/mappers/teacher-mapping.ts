import { nestEntityId } from '@/services/syllabus-config/real/real-syllabus-mappers';
import type { InternshipMentorCapacity } from '@/types/internship-enrollment';

import { asTrimmedString, isRecord } from './primitives';

/**
 * GET `/student-enrollments/teachers?schoolId=` — پاسخش در Swagger مستند نشده
 * (بدون schema)؛ طبق توضیح خودِ endpoint («share the student/trainee university
 * and have capacity») همان شکل `EnrollmentProfessorResponseDto` را حدس می‌زنیم
 * (`id`, `firstName`, `lastName`, `capacity`, `days`) — این مپر با فیلدهای
 * جایگزین احتمالی (`name`, `teacherId`, `remainingCapacity`) هم کار می‌کند.
 */
export function mapEnrollmentTeacher(
  raw: unknown,
  schoolId: string
): InternshipMentorCapacity | null {
  if (!isRecord(raw)) return null;
  const nested = isRecord(raw.teacher) ? raw.teacher : null;
  const row = { ...(nested ?? {}), ...raw };

  const id =
    nestEntityId({
      id: asTrimmedString(row.id) || undefined,
      _id: asTrimmedString((row as { _id?: unknown })._id) || undefined,
    }) || asTrimmedString(row.teacherId);

  const first = asTrimmedString(row.firstName) || asTrimmedString(row.fname);
  const last = asTrimmedString(row.lastName) || asTrimmedString(row.lname);
  const name = [first, last].filter(Boolean).join(' ').trim() || asTrimmedString(row.name);

  if (!id || !name) return null;

  return {
    id,
    name,
    schoolId,
    // ظرفیت به‌تفکیک سطح از این endpoint در دسترس نیست (مثل مدارس) — خالی می‌ماند.
    capacities: {},
  };
}

export function filterTeachersClientSide(
  teachers: InternshipMentorCapacity[],
  query: string
): InternshipMentorCapacity[] {
  const trimmed = query.trim().toLocaleLowerCase('fa-IR');
  if (!trimmed) return teachers;
  return teachers.filter((item) =>
    item.name.toLocaleLowerCase('fa-IR').includes(trimmed)
  );
}
