import { IS_MOCK_MODE } from '@/lib/api-mode';
import { buildCourseMaterial } from '@/services/course-materials/course-material-rules';
import { mockCourseMaterials } from '@/services/course-materials/mock/course-materials.fixtures';
import {
  deleteRealCourseMaterial,
  listRealManagedCourseMaterials,
  listRealReceivedCourseMaterials,
  publishRealCourseMaterial,
} from '@/services/course-materials/real/real-course-materials';
import type {
  CourseMaterial,
  PublishCourseMaterialInput,
} from '@/types/course-materials';
import type { InternshipCourseKind } from '@/types/internship-enrollment';

/**
 * جزوه و فایل درس: استاد راهنما منتشر می‌کند، فراگیران درس می‌بینند و دانلود می‌کنند.
 * UI فقط همین Facade را صدا می‌زند. mock: فقط داده‌ی ثابت؛ نوشتن‌ها چیزی ذخیره نمی‌کنند.
 */
export const CourseMaterialsService = {
  /** فایل‌های یک درس برای فراگیر. */
  async listReceived(
    kind: InternshipCourseKind,
    courseKey: string
  ): Promise<CourseMaterial[]> {
    if (!IS_MOCK_MODE) return listRealReceivedCourseMaterials(kind, courseKey);
    return mockCourseMaterials(kind, courseKey);
  },

  /** فایل‌هایی که کاربر جاری منتشر کرده است. */
  async listManaged(): Promise<CourseMaterial[]> {
    if (!IS_MOCK_MODE) return listRealManagedCourseMaterials();
    return mockCourseMaterials();
  },

  async publish(input: PublishCourseMaterialInput): Promise<CourseMaterial> {
    if (!IS_MOCK_MODE) return publishRealCourseMaterial(input);
    return buildCourseMaterial(
      {
        kind: input.kind,
        courseKey: input.courseKey,
        courseLabel: input.courseLabel,
        title: input.title,
        description: input.description,
        fileName: input.file.name,
        mimeType: input.file.type || 'application/octet-stream',
        sizeBytes: input.file.size,
        fileUrl: '',
      },
      { id: 'mock-supervisor', role: 'supervisor_professor', name: 'استاد راهنما' }
    );
  },

  async delete(id: string): Promise<void> {
    if (!IS_MOCK_MODE) return deleteRealCourseMaterial(id);
    void id;
  },
};
