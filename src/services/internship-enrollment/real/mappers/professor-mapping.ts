import { nestEntityId } from '@/services/syllabus-config/real/real-syllabus-mappers';
import type { NestEnrollmentProfessor } from '@/types/nest-student-enrollments';
import type { InternshipSupervisor } from '@/types/internship-enrollment';

import { asFiniteNumber, asTrimmedString, isRecord, namedTitle, NEST_DAY_FA } from './primitives';

function unwrapProfessor(raw: NestEnrollmentProfessor): Record<string, unknown> {
  const nested = isRecord(raw.professor) ? raw.professor : null;
  return { ...(nested ?? {}), ...raw };
}

function professorDisplayName(row: Record<string, unknown>): string {
  const first =
    asTrimmedString(row.firstName) || asTrimmedString(row.fname);
  const last = asTrimmedString(row.lastName) || asTrimmedString(row.lname);
  const full = [first, last].filter(Boolean).join(' ').trim();
  return full || asTrimmedString(row.name);
}

function professorDayLabels(row: Record<string, unknown>): string[] {
  const labeled = asTrimmedString(row.day);
  if (labeled) return [labeled];
  const days = Array.isArray(row.days) ? row.days : [];
  return days
    .filter((item): item is number => typeof item === 'number' && item >= 0 && item <= 5)
    .map((item) => NEST_DAY_FA[item])
    .filter((label): label is string => Boolean(label));
}

function professorRemaining(row: Record<string, unknown>): number | null {
  const remaining =
    asFiniteNumber(row.remainingCapacity) ?? asFiniteNumber(row.remaining);
  if (remaining !== null) return remaining;
  return asFiniteNumber(row.capacity);
}

export function mapEnrollmentProfessor(
  raw: unknown
): InternshipSupervisor | null {
  if (!isRecord(raw)) return null;
  const row = unwrapProfessor(raw as NestEnrollmentProfessor);
  const id =
    nestEntityId({
      id: asTrimmedString(row.id) || undefined,
      _id: asTrimmedString(row._id) || undefined,
    }) || asTrimmedString(row.professorId);
  const name = professorDisplayName(row);
  if (!id || !name) return null;
  return {
    id,
    name,
    college:
      namedTitle(row.university) ||
      namedTitle(row.college) ||
      namedTitle(row.campus),
    province: namedTitle(row.province),
    days: professorDayLabels(row),
    capacity: professorRemaining(row),
  };
}

export function filterSupervisorsClientSide(
  supervisors: InternshipSupervisor[],
  input: { query: string; province: string; college: string }
): InternshipSupervisor[] {
  const query = input.query.trim().toLocaleLowerCase('fa-IR');
  return supervisors.filter((item) => {
    if (
      input.province &&
      item.province &&
      item.province !== input.province
    ) {
      return false;
    }
    if (input.college && item.college && item.college !== input.college) {
      return false;
    }
    if (!query) return true;
    return item.name.toLocaleLowerCase('fa-IR').includes(query);
  });
}
