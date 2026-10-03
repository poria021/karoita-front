import { IS_MOCK_MODE } from '@/lib/api-mode';
import {
  buildCourseMaterial,
  isCourseMaterialForCourse,
  isCourseMaterialOwnedBy,
  sortCourseMaterials,
  validateCourseMaterialInput,
} from '@/services/course-materials/course-material-rules';
import {
  mockSessionAuthor,
  mutateMockCourseMaterials,
  readFileAsDataUrl,
  readMockCourseMaterials,
} from '@/services/course-materials/mock/mock-course-materials-store';
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
 * جزوه و فایل درس: استاد/مربی منتشر می‌کند، فراگیران درس می‌بینند و دانلود می‌کنند.
 * UI فقط همین Facade را صدا می‌زند. فعلاً فقط mock؛ real تا آمدن endpoint fail-closed است.
 */
export const CourseMaterialsService = {
  /** فایل‌های یک درس برای فراگیر. */
  async listReceived(
    kind: InternshipCourseKind,
    courseKey: string
  ): Promise<CourseMaterial[]> {
    if (!IS_MOCK_MODE) return listRealReceivedCourseMaterials(kind, courseKey);
    return sortCourseMaterials(
      readMockCourseMaterials().filter((row) =>
        isCourseMaterialForCourse(row, kind, courseKey)
      )
    );
  },

  /** فایل‌هایی که کاربر جاری منتشر کرده است. */
  async listManaged(): Promise<CourseMaterial[]> {
    if (!IS_MOCK_MODE) return listRealManagedCourseMaterials();
    const author = mockSessionAuthor();
    return sortCourseMaterials(
      readMockCourseMaterials().filter((row) =>
        isCourseMaterialOwnedBy(row, author.id)
      )
    );
  },

  async publish(input: PublishCourseMaterialInput): Promise<CourseMaterial> {
    if (!IS_MOCK_MODE) return publishRealCourseMaterial(input);
    const author = mockSessionAuthor();
    const error = validateCourseMaterialInput(input, author.role);
    if (error) throw new Error(error);
    const fileUrl = await readFileAsDataUrl(input.file);
    const created = buildCourseMaterial(
      {
        kind: input.kind,
        courseKey: input.courseKey,
        courseLabel: input.courseLabel,
        title: input.title,
        description: input.description,
        fileName: input.file.name,
        mimeType: input.file.type || 'application/octet-stream',
        sizeBytes: input.file.size,
        fileUrl,
      },
      author
    );
    mutateMockCourseMaterials((draft) => {
      draft.push(created);
    });
    return created;
  },

  async delete(id: string): Promise<void> {
    if (!IS_MOCK_MODE) return deleteRealCourseMaterial(id);
    const author = mockSessionAuthor();
    const row = readMockCourseMaterials().find((item) => item.id === id);
    if (!row || !isCourseMaterialOwnedBy(row, author.id)) {
      throw new Error('فایل یافت نشد یا متعلق به شما نیست.');
    }
    mutateMockCourseMaterials((draft) => draft.filter((item) => item.id !== id));
  },
};
