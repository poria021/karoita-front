/**
 * دادهٔ اولیهٔ نمایشی. فقط برای توسعهٔ محلی؛ هیچ‌کدام از این مقادیر داده‌ی واقعی نیست.
 * رمز حساب‌های تستی همان مقدار تستی پروژه است و جایی جز این seed استفاده نمی‌شود.
 */
import {
  newId,
  nowIso,
  type Store,
  type StoredFile,
} from './store';

export const SEED_PASSWORD = '12345678';
export const SEED_ADMIN_PHONE = '9123456786';
export const SEED_MENTOR_PHONE = '9123456787';

const ROLE_IDS: Record<string, string> = {
  student: '6a43982fceda93d39f5d3493',
  trainee: '6a43982fceda93d39f5d3494',
  mentor: '6a43982fceda93d39f5d3495',
  teacher: '6a43982fceda93d39f5d3496',
  school_admin: '6a43982fceda93d39f5d3497',
};

export function seedRoleId(name: string): string {
  return ROLE_IDS[name] ?? newId();
}

export function seedRoles(): Array<{ id: string; name: string }> {
  return Object.entries(ROLE_IDS).map(([name, id]) => ({ id, name }));
}

/** SVG ساده تا تصویرها واقعاً در مرورگر دیده شوند (برخلاف seed قدیمی mock). */
function svgBytes(label: string, hue: number): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <rect width="640" height="400" fill="hsl(${hue} 55% 42%)"/>
  <circle cx="540" cy="80" r="120" fill="hsl(${hue} 55% 52%)"/>
  <text x="320" y="215" font-size="42" text-anchor="middle" fill="#fff" font-family="sans-serif">${label}</text>
</svg>`;
  return Buffer.from(svg, 'utf8');
}

export function addSeedFile(
  store: Store,
  label: string,
  hue: number,
  uploadedById: string
): StoredFile {
  const bytes = svgBytes(label, hue);
  const file: StoredFile = {
    id: newId(),
    originalName: `${label}.svg`,
    mimeType: 'image/svg+xml',
    size: bytes.length,
    uploadedById,
    status: 'confirmed',
    confirmedAt: nowIso(),
    bytes,
  };
  store.files.set(file.id, file);
  return file;
}

export function seedStore(store: Store): void {
  const adminId = newId();
  store.admins.set(adminId, {
    id: adminId,
    fname: 'ادمین',
    lname: 'سیستم',
    phone: SEED_ADMIN_PHONE,
    role: 'superadmin',
    password: SEED_PASSWORD,
  });

  const mentorId = newId();
  store.users.set(mentorId, {
    id: mentorId,
    phone: `0${SEED_MENTOR_PHONE}`,
    firstName: 'امیرحسین',
    lastName: 'کریمی',
    roleName: 'mentor',
    roleId: seedRoleId('mentor'),
    password: SEED_PASSWORD,
  });

  const createdAt = nowIso();
  const banners: Array<[string, string | null, number]> = [
    ['سامانه مدیریت کارورزی', null, 215],
    ['ارزش‌های عملیاتی و دسترسی‌ها', '#benefits', 160],
    ['بیانیه اکوسیستم کارویتا', '/about', 280],
  ];
  for (const [title, link, hue] of banners) {
    const file = addSeedFile(store, title, hue, adminId);
    const id = newId();
    store.banners.set(id, {
      id,
      title,
      link,
      pictureId: file.id,
      createdAt,
      updatedAt: createdAt,
    });
  }

  const products: Array<[string, string, number]> = [
    ['پرتال پژوهشگران', '/auth/login', 30],
    ['باشگاه آزمون آنلاین', '/auth/login', 340],
    ['سامانه پایش مهارتی', '/auth/login', 190],
  ];
  for (const [title, link, hue] of products) {
    const file = addSeedFile(store, title, hue, adminId);
    const id = newId();
    store.products.set(id, {
      id,
      title,
      link,
      pictureId: file.id,
      createdAt,
      updatedAt: createdAt,
    });
  }

  const socials: Array<[string, string, number | null]> = [
    ['ایتا', 'https://eitaa.com/karvita', 25],
    ['تلگرام', 'https://t.me/karvita', 200],
    ['اینستاگرام', 'https://instagram.com/karvita', null],
  ];
  for (const [name, link, hue] of socials) {
    const file = hue === null ? null : addSeedFile(store, name, hue, adminId);
    const id = newId();
    store.socials.set(id, {
      id,
      name,
      link,
      pictureId: file?.id ?? null,
      createdAt,
      updatedAt: createdAt,
    });
  }

  store.notifications.push({
    id: newId(),
    title: 'به محیط آزمایشی خوش آمدید',
    body: 'این داده‌ها از سرور جعلی Nest می‌آیند و واقعی نیستند.',
    createdAt,
    readByUserIds: [],
  });
}
