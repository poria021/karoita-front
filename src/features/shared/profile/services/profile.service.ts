import { useUserStore } from '@/store/useUserStore';
import type { DocStatus, User, UserRole } from '@/types/auth';

import { profileSchema } from '../schemas/profile.schema';
import type { ProfileDTO } from '../types/profile.dto';

const LOCAL_DB_KEY = 'karvita_local_db';
const CURRENT_USER_KEY = 'current_user';
const USER_STORE_KEY = 'karvita-user-store';
const AUTH_USERS_KEY = 'karvita_mock_auth_users';
const API_MODE = process.env.NEXT_PUBLIC_API_MODE ?? 'mock';
const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
const MOCK_DELAY_MS = 350;

type JsonRecord = Record<string, unknown>;

interface LocalDatabase extends JsonRecord {
  users: JsonRecord[];
}

class ProfileServiceError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'ProfileServiceError';
  }
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJson(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function readCurrentUser(): JsonRecord | null {
  if (!isBrowser()) return null;

  const legacyUser =
    parseJson(window.localStorage.getItem(CURRENT_USER_KEY)) ??
    parseJson(window.sessionStorage.getItem(CURRENT_USER_KEY));
  if (isRecord(legacyUser)) return legacyUser;

  const persistedStore = parseJson(window.localStorage.getItem(USER_STORE_KEY));
  if (!isRecord(persistedStore) || !isRecord(persistedStore.state)) return null;
  return isRecord(persistedStore.state.activeUser)
    ? persistedStore.state.activeUser
    : null;
}

function userIdFromToken(token?: string): string | null {
  if (!token) return null;
  const normalized = token.replace(/^Bearer\s+/i, '').trim();
  const match = /^mock\.(.+)\.\d+$/.exec(normalized);
  return match?.[1] ?? null;
}

function recordMatchesUser(
  record: JsonRecord,
  currentUser: JsonRecord | null,
  token?: string
): boolean {
  const tokenUserId = userIdFromToken(token);
  if (tokenUserId && record.id === tokenUserId) return true;
  if (!currentUser) return false;

  return (
    (typeof currentUser.id === 'string' && record.id === currentUser.id) ||
    (typeof currentUser.mobile === 'string' &&
      record.mobile === currentUser.mobile)
  );
}

function readDatabase(): LocalDatabase {
  if (!isBrowser()) {
    throw new ProfileServiceError(
      'در حالت آزمایشی، دریافت پروفایل در سرور امکان‌پذیر نیست. توکن را به API واقعی ارسال کنید.'
    );
  }

  const rawDatabase = parseJson(window.localStorage.getItem(LOCAL_DB_KEY));
  if (isRecord(rawDatabase) && Array.isArray(rawDatabase.users)) {
    return {
      ...rawDatabase,
      users: rawDatabase.users.filter(isRecord),
    };
  }

  const currentUser = readCurrentUser();
  const database: LocalDatabase = {
    users: currentUser ? [currentUser] : [],
    reports: [],
    internships: [],
    logs: [],
  };
  writeDatabase(database);
  return database;
}

function writeDatabase(database: LocalDatabase): void {
  if (!isBrowser()) {
    throw new ProfileServiceError('ذخیره‌سازی محلی فقط در مرورگر امکان‌پذیر است.');
  }
  window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(database));
}

function parseProfile(value: unknown): ProfileDTO {
  const result = profileSchema.safeParse(value);
  if (!result.success) {
    const firstMessage = result.error.issues[0]?.message;
    throw new ProfileServiceError(
      firstMessage ?? 'اطلاعات پروفایل کامل یا معتبر نیست.'
    );
  }
  return result.data;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function asDocStatus(value: unknown): DocStatus | undefined {
  if (
    value === 'not_submitted' ||
    value === 'pending_admin' ||
    value === 'approved' ||
    value === 'rejected'
  ) {
    return value;
  }
  return undefined;
}

function asUserRole(value: unknown): UserRole | undefined {
  if (
    value === 'student' ||
    value === 'skill_learner' ||
    value === 'supervisor_professor' ||
    value === 'mentor_teacher' ||
    value === 'school_principal' ||
    value === 'regional_edu_admin' ||
    value === 'faculty_role' ||
    value === 'provincial_university' ||
    value === 'assistant_admin' ||
    value === 'central_organization' ||
    value === 'super_admin'
  ) {
    return value;
  }
  return undefined;
}

/** Merge persisted profile mutation fields into the live Zustand user. */
function mergeRecordIntoUser(activeUser: User, record: JsonRecord): User {
  return {
    ...activeUser,
    id: asString(record.id) ?? activeUser.id,
    firstName: asString(record.firstName) ?? activeUser.firstName,
    lastName: asString(record.lastName) ?? activeUser.lastName,
    mobile: asString(record.mobile) ?? activeUser.mobile,
    role: asUserRole(record.role) ?? activeUser.role,
    approved: asBoolean(record.approved) ?? activeUser.approved,
    docStatus: asDocStatus(record.docStatus) ?? activeUser.docStatus,
    hasPassword: asBoolean(record.hasPassword) ?? activeUser.hasPassword,
    adminRequestMessage:
      asString(record.adminRequestMessage) ?? activeUser.adminRequestMessage,
    province: asString(record.province) ?? activeUser.province,
    city: asString(record.city) ?? activeUser.city,
    college: asString(record.college) ?? activeUser.college,
    district: asString(record.district) ?? activeUser.district,
    school: asString(record.school) ?? activeUser.school,
    major: asString(record.major) ?? activeUser.major,
    personalCode: asString(record.personalCode) ?? activeUser.personalCode,
    studentId: asString(record.studentId) ?? activeUser.studentId,
    skillCode: asString(record.skillCode) ?? activeUser.skillCode,
  };
}

function syncCurrentUser(updatedRecord: JsonRecord): void {
  if (!isBrowser()) return;

  const legacyLocal = parseJson(window.localStorage.getItem(CURRENT_USER_KEY));
  if (isRecord(legacyLocal)) {
    window.localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify({ ...legacyLocal, ...updatedRecord })
    );
  }

  const legacySession = parseJson(window.sessionStorage.getItem(CURRENT_USER_KEY));
  if (isRecord(legacySession)) {
    window.sessionStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify({ ...legacySession, ...updatedRecord })
    );
  }

  const persistedStore = parseJson(window.localStorage.getItem(USER_STORE_KEY));
  if (
    isRecord(persistedStore) &&
    isRecord(persistedStore.state) &&
    isRecord(persistedStore.state.activeUser)
  ) {
    window.localStorage.setItem(
      USER_STORE_KEY,
      JSON.stringify({
        ...persistedStore,
        state: {
          ...persistedStore.state,
          activeUser: { ...persistedStore.state.activeUser, ...updatedRecord },
        },
      })
    );
  }

  const authUsers = parseJson(window.localStorage.getItem(AUTH_USERS_KEY));
  if (Array.isArray(authUsers)) {
    const synchronizedUsers = authUsers.map((user) =>
      isRecord(user) &&
      ((typeof updatedRecord.id === 'string' && user.id === updatedRecord.id) ||
        (typeof updatedRecord.mobile === 'string' &&
          user.mobile === updatedRecord.mobile))
        ? { ...user, ...updatedRecord }
        : user
    );
    window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(synchronizedUsers));
  }

  // Live Zustand update so profile banners react immediately (yellow → blue).
  const activeUser = useUserStore.getState().activeUser;
  if (activeUser) {
    useUserStore.getState().setUser(mergeRecordIntoUser(activeUser, updatedRecord));
  }
}

function extractApiPayload(payload: unknown): unknown {
  if (isRecord(payload) && 'data' in payload) return payload.data;
  return payload;
}

function extractApiMessage(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.message === 'string') return payload.message;
  if (Array.isArray(payload.message)) {
    const messages = payload.message.filter(
      (message): message is string => typeof message === 'string'
    );
    return messages.length > 0 ? messages.join('، ') : null;
  }
  return typeof payload.error === 'string' ? payload.error : null;
}

function isPersianMessage(message: string): boolean {
  return /[\u0600-\u06FF]/.test(message);
}

function defaultStatusMessage(status: number): string {
  if (status === 400) return 'اطلاعات ارسال‌شده معتبر نیست. لطفاً فیلدها را بررسی کنید.';
  if (status === 401) return 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.';
  if (status === 403) return 'شما اجازه انجام این عملیات را ندارید.';
  if (status === 404) return 'پروفایل کاربری یافت نشد.';
  if (status === 409) return 'اطلاعات پروفایل با داده‌های موجود تداخل دارد.';
  if (status === 413) return 'حجم فایل ارسالی بیش از حد مجاز است.';
  if (status >= 500) return 'سرویس پروفایل موقتاً در دسترس نیست. لطفاً کمی بعد تلاش کنید.';
  return 'انجام عملیات پروفایل با خطا مواجه شد.';
}

function localizedApiError(payload: unknown, status: number): string {
  const serverMessage = extractApiMessage(payload);
  return serverMessage && isPersianMessage(serverMessage)
    ? serverMessage
    : defaultStatusMessage(status);
}

async function readResponsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestProfile(
  method: 'GET' | 'PUT',
  token?: string,
  data?: ProfileDTO
): Promise<unknown> {
  if (!API_URL) {
    throw new ProfileServiceError('آدرس سرویس پروفایل پیکربندی نشده است.');
  }

  const headers = new Headers({ Accept: 'application/json' });
  if (data) headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set(
      'Authorization',
      token.startsWith('Bearer ') ? token : `Bearer ${token}`
    );
  }

  const response = await fetch(`${API_URL}/profile`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw new ProfileServiceError(
      localizedApiError(payload, response.status),
      response.status
    );
  }
  return payload;
}

async function requestIdentityDocument(
  documentBase64: string,
  token?: string
): Promise<void> {
  if (!API_URL) {
    throw new ProfileServiceError('آدرس سرویس پروفایل پیکربندی نشده است.');
  }

  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  });
  if (token) {
    headers.set(
      'Authorization',
      token.startsWith('Bearer ') ? token : `Bearer ${token}`
    );
  }

  const response = await fetch(`${API_URL}/profile/identity-document`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ documentBase64 }),
  });
  const payload = await readResponsePayload(response);
  if (!response.ok) {
    throw new ProfileServiceError(
      localizedApiError(payload, response.status),
      response.status
    );
  }
}

function friendlyError(error: unknown): Error {
  if (error instanceof ProfileServiceError) return error;
  if (error instanceof TypeError) {
    return new Error('ارتباط با سرویس پروفایل برقرار نشد. اتصال اینترنت را بررسی کنید.');
  }
  return new Error(
    error instanceof Error && error.message
      ? error.message
      : 'خطایی غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.'
  );
}

/** Environment-agnostic facade for mock local storage and external REST APIs. */
export class ProfileService {
  static async getProfile(token?: string): Promise<ProfileDTO> {
    try {
      if (API_MODE === 'real') {
        const payload = await requestProfile('GET', token);
        return parseProfile(extractApiPayload(payload));
      }

      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
      const database = readDatabase();
      const currentUser = readCurrentUser();
      const profile = database.users.find((user) =>
        recordMatchesUser(user, currentUser, token)
      );

      if (!profile) {
        throw new ProfileServiceError('پروفایل کاربری یافت نشد.', 404);
      }
      return parseProfile(profile);
    } catch (error) {
      throw friendlyError(error);
    }
  }

  static async updateProfile(
    data: ProfileDTO,
    token?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const validatedData = parseProfile(data);

      if (API_MODE === 'real') {
        const payload = await requestProfile('PUT', token, validatedData);
        const serverMessage = extractApiMessage(payload);
        return {
          success: true,
          message:
            serverMessage && isPersianMessage(serverMessage)
              ? serverMessage
              : 'اطلاعات پروفایل شما با موفقیت ذخیره شد.',
        };
      }

      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
      const database = readDatabase();
      const currentUser = readCurrentUser();
      const userIndex = database.users.findIndex((user) =>
        recordMatchesUser(user, currentUser, token)
      );

      if (userIndex === -1) {
        throw new ProfileServiceError('پروفایل کاربری یافت نشد.', 404);
      }

      const isSuperAdmin = validatedData.role === 'super_admin';
      const updatedRecord: JsonRecord = {
        ...database.users[userIndex],
        ...validatedData,
        approved: isSuperAdmin,
        docStatus: isSuperAdmin ? 'approved' : 'pending_admin',
        updatedAt: new Date().toISOString(),
      };

      database.users[userIndex] = updatedRecord;
      writeDatabase(database);
      syncCurrentUser(updatedRecord);

      return {
        success: true,
        message: 'اطلاعات پروفایل شما با موفقیت ذخیره شد.',
      };
    } catch (error) {
      throw friendlyError(error);
    }
  }

  /** Saves the already-compressed WebP identity document through the facade. */
  static async updateIdentityDocument(
    documentBase64: string,
    token?: string
  ): Promise<void> {
    try {
      if (!documentBase64.startsWith('data:image/webp;base64,')) {
        throw new ProfileServiceError('فرمت تصویر مدرک هویتی معتبر نیست.');
      }

      if (API_MODE === 'real') {
        await requestIdentityDocument(documentBase64, token);
        return;
      }

      const database = readDatabase();
      const currentUser = readCurrentUser();
      const userIndex = database.users.findIndex((user) =>
        recordMatchesUser(user, currentUser, token)
      );
      if (userIndex === -1) {
        throw new ProfileServiceError('پروفایل کاربری یافت نشد.', 404);
      }

      const updatedRecord = {
        ...database.users[userIndex],
        docUrl: documentBase64,
        lastSubmittedFileName: 'identity-document.webp',
      };
      database.users[userIndex] = updatedRecord;
      writeDatabase(database);
      syncCurrentUser(updatedRecord);
    } catch (error) {
      throw friendlyError(error);
    }
  }
}
