/**
 * حافظهٔ سرور جعلی. با هر `createStore()` تازه و جدا از بقیه است (تست‌ها مستقل‌اند)
 * و با ریستارت سرور از seed شروع می‌شود. داده فقط نمایشی است؛ رمزها مقدار تستی‌اند.
 */
import { randomBytes } from 'node:crypto';

export type AccountSurface = 'admin' | 'user';

export type Session = {
  surface: AccountSurface;
  accountId: string;
  kind: 'access' | 'refresh';
};

export type StoredAdmin = {
  id: string;
  fname: string;
  lname: string;
  phone: string;
  role: 'superadmin' | 'admin';
  password: string;
};

export type StoredUser = {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  /** نام نقش Nest (`mentor` = استاد راهنما، `student`، …). */
  roleName: string;
  roleId: string;
  password: string;
  /** مدرسهٔ معلم راهنما / مدیر مدرسه (برای فیلتر `teachers` و `mentor/students`). */
  schoolId?: string;
};

export type StoredFile = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedById: string;
  status: 'pending' | 'confirmed';
  confirmedAt: string | null;
  bytes: Buffer | null;
};

export type StoredBanner = {
  id: string;
  title: string;
  link: string | null;
  pictureId: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredProduct = {
  id: string;
  title: string;
  link: string;
  pictureId: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredSocial = {
  id: string;
  name: string;
  link: string;
  pictureId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StoredNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  readByUserIds: string[];
};

/** اطلاعیه/تبلیغ؛ نقش‌ها نام‌های Nest هستند. قرارداد: openapi.proposed.json */
export type StoredBulletin = {
  id: string;
  kind: 'announcement' | 'advertisement';
  title: string;
  body: string;
  linkUrl?: string;
  imageUrl?: string;
  authorRole: string;
  authorName: string;
  audienceRoles: string[];
  provinces: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StoredProvince = { id: string; title: string };

export type TermStructure = 'semester' | 'podmani';

export type StoredSemester = {
  id: string;
  season: 'one' | 'two' | 'summer';
  structure: TermStructure;
  academicYear: string;
  courseSelection: boolean;
  startClasses: boolean;
  createdAt: string;
  updatedAt: string;
};

/** درس یک ترم؛ `status` پرچم «ارائه شده» است. */
export type StoredLesson = {
  id: string;
  semesterId: string;
  title: string;
  status: boolean;
  /** فقط وقتی ترم از «تعریف دروس» ساخته شود (`FAKE_NEST_TERM_LESSONS=original`). */
  originalLessonId?: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredWeek = {
  id: string;
  lessonId: string;
  priority: number;
  status: boolean;
  createdAt: string;
};

export type StoredSettings = {
  id: string;
  generalProfessorCapacity: number;
  systemPassingScore: number;
  createdAt: string;
};

export type StoredOriginalLesson = {
  id: string;
  type: TermStructure;
  mainTitle: string;
  lessonTitle: string;
  status: 'active' | 'deactive';
  createdAt: string;
  updatedAt: string;
};

export type StoredProfessorCapacity = {
  id: string;
  professorId: string;
  lessonId: string;
  semesterId: string;
  capacity: number;
  days: number[];
};

export type StoredSchool = { id: string; title: string };

export type EnrollmentStatus = 'active' | 'completed' | 'cancelled';

export type StoredEnrollment = {
  id: string;
  studentId: string;
  semesterId: string;
  lessonId: string;
  schoolId: string | null;
  teacherId: string | null;
  professorId: string;
  status: EnrollmentStatus;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudentWeekStatus = 'pending' | 'in_progress' | 'submitted' | 'completed';

/**
 * هفتهٔ یک ثبت‌نام. فیلدهای `*Status` در Swagger نیست ولی بک‌اند زنده می‌دهد و
 * فرانت (`mapWeekStatus`) روی آن‌ها رنگ کارت را می‌سازد: `send` یعنی آن نقش
 * پیام فرستاده؛ `mentorStatus` بعد از نمره‌دهی `score` می‌شود.
 */
export type StoredStudentWeek = {
  id: string;
  enrollmentId: string;
  /** شناسهٔ تعریف هفته (`StoredWeek.id`). */
  weekId: string;
  status: StudentWeekStatus;
  score: number | null;
  weightedScore: number | null;
  scoreGivenBy: string | null;
  scoreGivenAt: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  completedAt: string | null;
  studentStatus: 'send' | null;
  mentorStatus: 'send' | 'score' | null;
  teacherStatus: 'send' | null;
  schoolAdminStatus: 'send' | null;
  schoolVisited: boolean;
  isMentorPresent: boolean;
  isApprovedBySchoolAdminMentorPresent: boolean;
  mentorPresentAt: string | null;
  isApprovedBySchoolAdminStudentPresent: boolean;
  studentPresentAt: string | null;
  canWatchOthers: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StoredConversation = {
  id: string;
  enrollmentId: string;
  /** شناسهٔ تعریف هفته؛ برای گفتگوی `general` خالی. */
  weekId: string | null;
  type: 'general' | 'week';
  readStates: Map<string, { lastReadSequence: number; lastReadAt: string }>;
  createdAt: string;
  updatedAt: string;
};

export type StoredMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  text: string | null;
  fileIds: string[];
  rating: number | null;
  sequence: number;
  createdAt: string;
  updatedAt: string;
};

export type StoredMentorLessonFile = {
  id: string;
  professorId: string;
  lessonId: string;
  description: string | null;
  fileIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type Store = {
  /** آدرس عمومی سرور جعلی (برای `path` فایل‌ها و آدرس امضاشده). */
  publicUrl: string;
  admins: Map<string, StoredAdmin>;
  users: Map<string, StoredUser>;
  sessions: Map<string, Session>;
  files: Map<string, StoredFile>;
  banners: Map<string, StoredBanner>;
  products: Map<string, StoredProduct>;
  socials: Map<string, StoredSocial>;
  notifications: StoredNotification[];
  semesters: Map<string, StoredSemester>;
  lessons: Map<string, StoredLesson>;
  weeks: Map<string, StoredWeek>;
  /** هر POST یک ردیف جدید می‌افزاید و GET آخرین را می‌دهد. */
  settings: StoredSettings[];
  originalLessons: Map<string, StoredOriginalLesson>;
  professorCapacities: Map<string, StoredProfessorCapacity>;
  schools: Map<string, StoredSchool>;
  enrollments: Map<string, StoredEnrollment>;
  studentWeeks: Map<string, StoredStudentWeek>;
  conversations: Map<string, StoredConversation>;
  messages: StoredMessage[];
  mentorLessonFiles: Map<string, StoredMentorLessonFile>;
  bulletins: StoredBulletin[];
  provinces: Map<string, StoredProvince>;
};

/** شناسهٔ ۲۴ کاراکتری hex شبیه ObjectId مونگو. */
export function newId(): string {
  return randomBytes(12).toString('hex');
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function createStore(publicUrl: string): Store {
  return {
    publicUrl: publicUrl.replace(/\/$/, ''),
    admins: new Map(),
    users: new Map(),
    sessions: new Map(),
    files: new Map(),
    banners: new Map(),
    products: new Map(),
    socials: new Map(),
    notifications: [],
    semesters: new Map(),
    lessons: new Map(),
    weeks: new Map(),
    settings: [],
    originalLessons: new Map(),
    professorCapacities: new Map(),
    schools: new Map(),
    enrollments: new Map(),
    studentWeeks: new Map(),
    conversations: new Map(),
    messages: [],
    mentorLessonFiles: new Map(),
    bulletins: [],
    provinces: new Map(),
  };
}

/**
 * خالی‌کردن در جا. handlerها `store.banners` و مانند آن را هنگام ثبت نگه می‌دارند،
 * پس reset نباید Mapهای تازه بسازد؛ همان آبجکت‌ها باید خالی و دوباره seed شوند.
 */
export function clearStore(store: Store): void {
  store.admins.clear();
  store.users.clear();
  store.sessions.clear();
  store.files.clear();
  store.banners.clear();
  store.products.clear();
  store.socials.clear();
  store.notifications.length = 0;
  store.semesters.clear();
  store.lessons.clear();
  store.weeks.clear();
  store.settings.length = 0;
  store.originalLessons.clear();
  store.professorCapacities.clear();
  store.schools.clear();
  store.enrollments.clear();
  store.studentWeeks.clear();
  store.conversations.clear();
  store.messages.length = 0;
  store.mentorLessonFiles.clear();
  store.bulletins.length = 0;
  store.provinces.clear();
}

/** صفحه‌بندی هم‌شکل Nest: `{ data, hasNextPage }`. */
export function paginate<T>(
  items: readonly T[],
  query: URLSearchParams
): { data: T[]; hasNextPage: boolean } {
  const page = Math.max(1, Number(query.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.get('limit')) || 10));
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    hasNextPage: start + limit < items.length,
  };
}
