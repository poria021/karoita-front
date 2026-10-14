export interface NestCreateMentorLessonFileDto {
  lessonId: string;
  fileIds: string[];
  description?: string;
}

/** فایل populate‌شده در رکورد؛ Swagger شِمای پاسخ را مستند نکرده، پس همه اختیاری. */
export interface NestMentorLessonFileItem {
  id?: string;
  _id?: string;
  path?: string;
  fileName?: string;
  name?: string;
  originalName?: string;
  mimeType?: string;
  fileSize?: number;
  size?: number;
}

/**
 * رکورد GET/POST `/v1/mentor-lesson-files` و GET `/v1/lessons/{id}/mentor-files`.
 * فقط `id` قطعی است؛ بقیه دفاعی خوانده می‌شوند (`fileIds` ممکن است populate شده باشد).
 */
export interface NestMentorLessonFile {
  id: string;
  _id?: string;
  lessonId?: string | { id?: string; _id?: string; title?: string; name?: string };
  mentorId?: string | { id?: string; firstName?: string; lastName?: string };
  description?: string | null;
  fileIds?: Array<string | NestMentorLessonFileItem>;
  files?: NestMentorLessonFileItem[];
  createdAt?: string;
}
