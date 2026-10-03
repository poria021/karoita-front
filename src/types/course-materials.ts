import type { UserRole } from '@/types/auth';
import type { InternshipCourseKind } from '@/types/internship-enrollment';

/** جزوه/فایل آموزشی که استاد راهنما برای فراگیران درس منتشر می‌کند. */
export interface CourseMaterial {
  id: string;
  kind: InternshipCourseKind;
  /** کلید درس هم‌تراز با فیلتر درس صفحهٔ ارزیابی (`evaluationCourseFilterId`). */
  courseKey: string;
  courseLabel: string;
  title: string;
  description: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  /** data URL در mock؛ در real آدرس فایل Nest. */
  fileUrl: string;
  authorId: string;
  authorRole: UserRole;
  authorName: string;
  createdAt: string;
}

export type PublishCourseMaterialInput = {
  kind: InternshipCourseKind;
  courseKey: string;
  courseLabel: string;
  title: string;
  description: string;
  file: File;
};

export type CourseMaterialAuthor = {
  id: string;
  role: UserRole;
  name: string;
};
