export type OriginalLessonType = 'semester' | 'podmani';

export interface NestLessonItem {
  lessonTitle: string;
}

export interface NestOriginalLessonGroup {
  mainTitle: string;
  lessons: NestLessonItem[];
}

/** بدنه POST /original-lessons */
export interface NestBulkCreateOriginalLessonDto {
  type: OriginalLessonType;
  data: NestOriginalLessonGroup[];
}

export type OriginalLessonStatus = 'active' | 'deactive';

/** هر آیتم جواب 201 */
export interface NestOriginalLesson {
  id: string;
  status: OriginalLessonStatus;
  type: OriginalLessonType;
  mainTitle: string;
  lessonTitle: string;
  createdAt: string;
  updatedAt: string;
}

/** پارامترهای GET /original-lessons (همه اختیاری). */
export type NestOriginalLessonListQuery = {
  page?: number;
  limit?: number;
  mainTitle?: string;
};

/** بدنه PATCH /original-lessons/{id} (همه فیلدها اختیاری). */
export interface NestUpdateOriginalLessonDto {
  status?: OriginalLessonStatus;
  type?: OriginalLessonType;
  mainTitle?: string;
  lessonTitle?: string;
}
