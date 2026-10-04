import type { UserRole } from '@/types/auth';
import type {
  CourseMaterial,
  CourseMaterialAuthor,
} from '@/types/course-materials';
import type { InternshipCourseKind } from '@/types/internship-enrollment';

export const COURSE_MATERIAL_TITLE_MAX = 120;
export const COURSE_MATERIAL_DESCRIPTION_MAX = 500;
/** سقف حجم فایل جزوه. */
export const COURSE_MATERIAL_MAX_BYTES = 2 * 1024 * 1024;

export const COURSE_MATERIAL_ACCEPT =
  '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.png,.jpg,.jpeg,.mp4,.mp3';

/** نقشهٔ accept دراپ‌زون — هم‌خوان با `COURSE_MATERIAL_ACCEPT`. */
export const COURSE_MATERIAL_ACCEPT_MAP: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/plain': ['.txt'],
  'application/zip': ['.zip'],
  'application/x-zip-compressed': ['.zip'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'video/mp4': ['.mp4'],
  'audio/mpeg': ['.mp3'],
};

const ALLOWED_EXTENSIONS =new Set(
  COURSE_MATERIAL_ACCEPT.split(',').map((ext) => ext.slice(1))
);

/** فقط استاد راهنما فایل درس بارگذاری می‌کند؛ معلم/مدیر مدرسه نه. */
export function canPublishCourseMaterials(
  role: UserRole | string | null | undefined
): boolean {
  return role === 'supervisor_professor';
}

export function fileExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx < 0 ? '' : name.slice(idx + 1).toLowerCase();
}

/** پیام فارسی برای فرم؛ `null` یعنی معتبر. */
export function validateCourseMaterialInput(
  input: {
    courseKey: string;
    title: string;
    description: string;
    file: Pick<File, 'name' | 'size'> | null;
  },
  authorRole: UserRole | string | null | undefined
): string | null {
  if (!canPublishCourseMaterials(authorRole)) {
    return 'بارگذاری فایل فقط برای استاد راهنما مجاز است.';
  }
  if (!input.courseKey) return 'درس را انتخاب کنید.';
  const title = input.title.trim();
  if (!title) return 'عنوان الزامی است.';
  if (title.length > COURSE_MATERIAL_TITLE_MAX) {
    return `عنوان حداکثر ${COURSE_MATERIAL_TITLE_MAX} نویسه است.`;
  }
  if (input.description.trim().length > COURSE_MATERIAL_DESCRIPTION_MAX) {
    return `توضیحات حداکثر ${COURSE_MATERIAL_DESCRIPTION_MAX} نویسه است.`;
  }
  if (!input.file) return 'یک فایل انتخاب کنید.';
  if (!ALLOWED_EXTENSIONS.has(fileExtension(input.file.name))) {
    return 'فرمت فایل مجاز نیست.';
  }
  if (input.file.size <= 0) return 'فایل خالی است.';
  if (input.file.size > COURSE_MATERIAL_MAX_BYTES) {
    return 'حجم فایل بیش از ۲ مگابایت است.';
  }
  return null;
}

function newMaterialId(): string {
  return `cm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function buildCourseMaterial(
  input: {
    kind: InternshipCourseKind;
    courseKey: string;
    courseLabel: string;
    title: string;
    description: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    fileUrl: string;
  },
  author: CourseMaterialAuthor,
  now: Date = new Date()
): CourseMaterial {
  return {
    id: newMaterialId(),
    kind: input.kind,
    courseKey: input.courseKey,
    courseLabel: input.courseLabel,
    title: input.title.trim(),
    description: input.description.trim(),
    fileName: input.fileName,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    fileUrl: input.fileUrl,
    authorId: author.id,
    authorRole: author.role,
    authorName: author.name,
    createdAt: now.toISOString(),
  };
}
