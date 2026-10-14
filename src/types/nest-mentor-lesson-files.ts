export interface NestCreateMentorLessonFileDto {
  lessonId: string;
  fileIds: string[];
  description?: string;
}

/** `FileObjectDto` در Swagger — فقط شناسه و آدرس کامل؛ نام/حجم/نوع فایل را بک‌اند نمی‌دهد. */
export interface NestMentorLessonFileObject {
  id: string;
  /** آدرس کامل فایل. */
  path: string;
  confirmedAt?: string | null;
}

/**
 * `MentorLessonFileResponseDto`: ردیف GET `/v1/mentor-lesson-files` و
 * GET `/v1/lessons/{lessonId}/mentor-files`. پاسخ POST در Swagger مستند نیست.
 */
export interface NestMentorLessonFile {
  id: string;
  professorId: string;
  lessonId: string;
  description?: string | null;
  files: NestMentorLessonFileObject[];
  createdAt: string;
  updatedAt: string;
}
