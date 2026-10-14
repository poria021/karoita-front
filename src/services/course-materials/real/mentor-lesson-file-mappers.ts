import type { CourseMaterial } from '@/types/course-materials';
import type { InternshipCourseKind } from '@/types/internship-enrollment';
import type { NestMentorLessonFile } from '@/types/nest-mentor-lesson-files';

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
  zip: 'application/zip',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  mp4: 'video/mp4',
  mp3: 'audio/mpeg',
};

/** آخرین بخش مسیر (بدون query) به‌عنوان نام قابل‌نمایش — بک‌اند نام فایل نمی‌دهد. */
function fileNameFromPath(path: string): string {
  const last = (path.split(/[?#]/)[0] ?? path).split('/').pop() ?? '';
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

function mimeFromName(name: string): string {
  const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';
  return MIME_BY_EXTENSION[ext] ?? 'application/octet-stream';
}

/**
 * هر رکورد Nest می‌تواند چند فایل داشته باشد؛ UI هر فایل را یک ردیف می‌بیند.
 * `recordId` برای DELETE (که روی کل رکورد است) نگه داشته می‌شود.
 * حجم فایل در قرارداد نیست؛ `sizeBytes: 0` یعنی «نامشخص» و UI نشانش نمی‌دهد.
 */
export function mapMentorLessonFileRecord(
  record: NestMentorLessonFile,
  context: { kind: InternshipCourseKind; courseLabel?: string }
): CourseMaterial[] {
  return record.files.map((file) => {
    const fileName = fileNameFromPath(file.path);
    return {
      id: record.files.length > 1 ? `${record.id}:${file.id}` : record.id,
      recordId: record.id,
      kind: context.kind,
      courseKey: record.lessonId,
      courseLabel: context.courseLabel ?? '',
      title: fileName || 'فایل درس',
      description: (record.description ?? '').trim(),
      fileName: fileName || 'file',
      mimeType: mimeFromName(fileName),
      sizeBytes: 0,
      // آدرس کامل؛ `CourseMaterialRow` با `toSameOriginMediaUrl` resolve می‌کند.
      fileUrl: file.path,
      authorId: record.professorId,
      authorRole: 'supervisor_professor',
      authorName: '',
      createdAt: record.createdAt,
    };
  });
}
