/**
 * لیست دوره‌ها برای انتخاب دوره در گزارش «لیست فراگیران».
 * API لیست دوره ندارد؛ از `GET admin/semesters_all?structure=semester|podmani`
 * (همان API ترم‌های پروژه) استفاده می‌شود.
 */
import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import { parseNestSemesterList } from '@/services/syllabus-config/real/mappers/nest-raw-parsers';
import { toAcademicTerm } from '@/services/syllabus-config/real/mappers/term-mapping';
import type { NestSemesterAllStructure } from '@/types/nest-admin';
import type { ReportOption, ReportPeriodMode } from '@/types/reports';

/** حالت UI (`term`/`module`) ↔ `structure` در Nest. */
export function structureForPeriodMode(
  mode: ReportPeriodMode
): NestSemesterAllStructure {
  return mode === 'term' ? 'semester' : 'podmani';
}

export async function fetchReportPeriods(
  mode: ReportPeriodMode
): Promise<ReportOption[]> {
  const raw = await adminCatalogApi.listSemestersAll(
    structureForPeriodMode(mode)
  );
  return parseNestSemesterList(raw).map((semester) => ({
    value: semester.id,
    label: toAcademicTerm(semester).title || semester.id,
  }));
}
