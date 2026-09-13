import { nestEntityId } from '@/services/syllabus-config/real/real-syllabus-mappers';
import type { NestSchool } from '@/types/nest-admin';
import type { InternshipSchoolCapacity } from '@/types/internship-enrollment';

import { asTrimmedString, isRecord, namedTitle } from './primitives';

export function mapNestSchool(raw: unknown): InternshipSchoolCapacity | null {
  if (!isRecord(raw)) return null;
  const row = raw as NestSchool;
  const id = nestEntityId({
    id: asTrimmedString(row.id) || undefined,
    _id: asTrimmedString((row as { _id?: string })._id) || undefined,
  });
  const name = asTrimmedString(row.title);
  if (!id || !name) return null;
  return {
    id,
    name,
    province: namedTitle(row.province),
    district:
      namedTitle(row.education) ||
      namedTitle(row.educationalDistrict) ||
      namedTitle(row.district),
    capacities: {},
  };
}

/** GET `/admin/schools` استانِ درخواستی را برنمی‌گرداند به صورت id — همان الگوی فیلتر سمت کلاینت `filterSupervisorsClientSide`. */
export function filterSchoolsClientSide(
  schools: InternshipSchoolCapacity[],
  input: { query: string; province: string }
): InternshipSchoolCapacity[] {
  const query = input.query.trim().toLocaleLowerCase('fa-IR');
  return schools.filter((item) => {
    if (input.province && item.province && item.province !== input.province) {
      return false;
    }
    if (!query) return true;
    return item.name.toLocaleLowerCase('fa-IR').includes(query);
  });
}
