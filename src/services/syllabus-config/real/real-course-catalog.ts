import { throwRealModeNotImplemented } from '@/lib/api-mode';
import type {
  CourseDefinition,
  SyllabusConfigSnapshot,
  UpsertCourseDefinitionInput,
} from '@/types/syllabus-config';

/**
 * کاتالوگ داینامیک دروس هنوز endpoint در Nest ندارد — fail-closed.
 * وقتی API رسید فقط همین فایل (و mapper آن) عوض شود؛ شکل Facade ثابت می‌ماند.
 */

export async function listRealCourseDefinitions(): Promise<CourseDefinition[]> {
  throwRealModeNotImplemented('SyllabusConfigService.listCourseDefinitions');
}

export async function createRealCourseDefinition(
  input: UpsertCourseDefinitionInput
): Promise<SyllabusConfigSnapshot> {
  void input;
  throwRealModeNotImplemented('SyllabusConfigService.createCourseDefinition');
}

export async function updateRealCourseDefinition(
  id: string,
  input: UpsertCourseDefinitionInput
): Promise<SyllabusConfigSnapshot> {
  void id;
  void input;
  throwRealModeNotImplemented('SyllabusConfigService.updateCourseDefinition');
}

export async function deleteRealCourseDefinition(
  id: string
): Promise<SyllabusConfigSnapshot> {
  void id;
  throwRealModeNotImplemented('SyllabusConfigService.deleteCourseDefinition');
}
