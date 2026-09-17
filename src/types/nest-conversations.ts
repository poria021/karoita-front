/**
 * DTOهای گفتگو/بازخورد — `GET/POST /api/v1/conversations*`.
 * Swagger هیچ `POST /api/v1/conversations` ندارد؛ یعنی خودِ conversation باید
 * از قبل (فرضاً خودکار توسط بک‌اند) وجود داشته باشد — این لایه فقط پیدا/خواندن/
 * نوشتن پیام را پوشش می‌دهد، نه ساختن گفتگوی جدید.
 */

export type NestConversationType = 'general' | 'week';

export type NestConversationReadState = {
  userId: string;
  lastReadSequence: number;
  lastReadAt?: string | null;
};

export type NestConversation = {
  id: string;
  enrollmentId: string;
  weekId?: string | null;
  participantIds: string[];
  type: NestConversationType;
  lastMessageSequence: number;
  lastMessageAt?: string | null;
  readStates: NestConversationReadState[];
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
};

export type NestMessageSubmissionFile = {
  id: string;
  path: string;
};

/**
 * لایو تأیید شد: برخلاف فرضِ اولیه (رشتهٔ خام)، `senderId` روی
 * `GET /conversations/{id}/messages` یک سند populated با `role` است — نیازی
 * به یک `GET /users/{id}` جدا برای تشخیص نقش فرستنده نیست.
 */
export type NestMessageSender = {
  id: string;
  /** رشتهٔ نقش Nest (مثل `mentor`/`teacher`/`school_admin`) — با `fromNestRoleName` بخوان. */
  role: string;
};

export type NestMessage = {
  id: string;
  conversationId: string;
  senderId: NestMessageSender;
  text?: string | null;
  fileIds: string[];
  files: NestMessageSubmissionFile[];
  /** فقط پیام‌های معلم راهنما/مدیر مدرسه دارند — امتیاز شایستگی ۰ تا ۵. */
  rating?: number | null;
  sequence: number;
  createdAt: string;
  updatedAt: string;
};

export type NestMessageListResponse = {
  data: NestMessage[];
  hasNextPage: boolean;
};

/**
 * بدنهٔ `POST /api/v1/conversations/{id}/messages` — `CreateContentDto`.
 * لایو تأیید شد: برخلاف فرضِ اولیه، `rating` هم روی بدنهٔ POST هست — امتیاز
 * شایستگی معلم راهنما/مدیر مدرسه دقیقاً از همین‌جا ثبت می‌شود (ببین
 * `submitMentorFeedbackReal`/`submitPrincipalFeedbackReal`).
 */
export type NestCreateMessageDto = {
  /** حداکثر ۱۰۰۰۰ نویسه طبق Swagger. */
  text?: string;
  fileIds?: string[];
  /** فقط پیام معلم راهنما/مدیر مدرسه — امتیاز شایستگی ۰ تا ۵. */
  rating?: number;
};
