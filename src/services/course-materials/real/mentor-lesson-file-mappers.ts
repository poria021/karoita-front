import type { CourseMaterial } from '@/types/course-materials';
import type { InternshipCourseKind } from '@/types/internship-enrollment';
import type {
  NestMentorLessonFile,
  NestMentorLessonFileItem,
} from '@/types/nest-mentor-lesson-files';

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

function refId(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const row = value as { id?: unknown; _id?: unknown };
    if (typeof row.id === 'string') return row.id;
    if (typeof row._id === 'string') return row._id;
  }
  return '';
}

/** آخرین بخش مسیر (بدون query) به‌عنوان نام قابل‌نمایش. */
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

function recordFiles(record: NestMentorLessonFile): NestMentorLessonFileItem[] {
  const populated = (record.fileIds ?? []).filter(
    (item): item is NestMentorLessonFileItem => typeof item === 'object' && item !== null
  );
  if (Array.isArray(record.files) && record.files.length > 0) return record.files;
  if (populated.length > 0) return populated;
  // فقط شناسه برگشته — بدون مسیر لینک دانلود نداریم ولی ردیف (برای حذف) نمایش داده می‌شود.
  return (record.fileIds ?? [])
    .filter((item): item is string => typeof item === 'string')
    .map((id) => ({ id }));
}

/**
 * هر رکورد Nest می‌تواند چند فایل داشته باشد؛ UI هر فایل را یک ردیف می‌بیند.
 * `recordId` برای DELETE (که روی کل رکورد است) نگه داشته می‌شود.
 */
export function mapMentorLessonFileRecord(
  record: NestMentorLessonFile,
  context: { kind: InternshipCourseKind; courseLabel?: string }
): CourseMaterial[] {
  const recordId = refId(record) || record.id;
  const files = recordFiles(record);
  const lessonId = refId(record.lessonId);
  const lessonTitle =
    record.lessonId && typeof record.lessonId === 'object'
      ? (record.lessonId.title ?? record.lessonId.name ?? '')
      : '';
  const mentor =
    record.mentorId && typeof record.mentorId === 'object' ? record.mentorId : null;

  return files.map((file, index) => {
    const path = file.path ?? '';
    const fileName =
      file.fileName ?? file.originalName ?? file.name ?? (path ? fileNameFromPath(path) : '');
    return {
      id: files.length > 1 ? `${recordId}:${refId(file) || index}` : recordId,
      recordId,
      kind: context.kind,
      courseKey: lessonId,
      courseLabel: context.courseLabel || lessonTitle,
      title: fileName || 'فایل درس',
      description: (record.description ?? '').trim(),
      fileName: fileName || 'file',
      mimeType: file.mimeType ?? mimeFromName(fileName),
      sizeBytes: file.fileSize ?? file.size ?? 0,
      // خام؛ `CourseMaterialRow` با `toSameOriginMediaUrl` resolve می‌کند.
      fileUrl: path,
      authorId: refId(record.mentorId),
      authorRole: 'supervisor_professor',
      authorName: mentor
        ? [mentor.firstName, mentor.lastName].filter(Boolean).join(' ')
        : '',
      createdAt: record.createdAt ?? '',
    };
  });
}
