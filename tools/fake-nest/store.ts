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
