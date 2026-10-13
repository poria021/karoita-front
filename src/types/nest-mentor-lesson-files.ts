export interface NestCreateMentorLessonFileDto {
  lessonId: string;
  fileIds: string[];
  description?: string;
}

export interface NestMentorLessonFile {
  id: string;
}
