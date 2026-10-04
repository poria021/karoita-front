import type { CourseMaterial } from '@/types/course-materials';
import type { InternshipCourseKind } from '@/types/internship-enrollment';

/** داده‌ی ثابت حالت mock — هیچ state یا ذخیره‌سازی‌ای ندارد. */
export function mockCourseMaterials(
  kind: InternshipCourseKind = 'internship',
  courseKey = 'intern1'
): CourseMaterial[] {
  const base = {
    kind,
    courseKey,
    courseLabel: 'درس نمونه',
    authorId: 'mock-supervisor',
    authorRole: 'supervisor_professor' as const,
    authorName: 'استاد راهنما',
    mimeType: 'application/pdf',
    fileUrl: '',
  };
  return [
    {
      ...base,
      id: 'cm_mock_1',
      title: 'راهنمای نگارش گزارش هفتگی',
      description: 'نکات و قالب پیشنهادی برای نگارش گزارش هفتگی.',
      fileName: 'weekly-report-guide.pdf',
      sizeBytes: 480_000,
      createdAt: new Date(Date.now() - 48 * 3_600_000).toISOString(),
    },
    {
      ...base,
      id: 'cm_mock_2',
      title: 'جزوهٔ جلسهٔ اول',
      description: '',
      fileName: 'session-1.pdf',
      sizeBytes: 1_200_000,
      createdAt: new Date(Date.now() - 120 * 3_600_000).toISOString(),
    },
  ];
}
