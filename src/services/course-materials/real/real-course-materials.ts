import { throwRealModeNotImplemented } from '@/lib/api-mode';
import type {
  CourseMaterial,
  PublishCourseMaterialInput,
} from '@/types/course-materials';
import type { InternshipCourseKind } from '@/types/internship-enrollment';

/**
 * جزوه/فایل درس هنوز endpoint در Nest ندارد — fail-closed.
 * وقتی API رسید: `FilesService.uploadFile` برای بایت‌ها + ثبت متادیتا؛ فقط همین فایل عوض شود.
 */

export async function listRealReceivedCourseMaterials(
  kind: InternshipCourseKind,
  courseKey: string
): Promise<CourseMaterial[]> {
  void kind;
  void courseKey;
  throwRealModeNotImplemented('CourseMaterialsService.listReceived');
}

export async function listRealManagedCourseMaterials(): Promise<CourseMaterial[]> {
  throwRealModeNotImplemented('CourseMaterialsService.listManaged');
}

export async function publishRealCourseMaterial(
  input: PublishCourseMaterialInput
): Promise<CourseMaterial> {
  void input;
  throwRealModeNotImplemented('CourseMaterialsService.publish');
}

export async function deleteRealCourseMaterial(id: string): Promise<void> {
  void id;
  throwRealModeNotImplemented('CourseMaterialsService.delete');
}
