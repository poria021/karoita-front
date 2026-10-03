import type { UserRole } from '@/types/auth';
import type {
  Bulletin,
  BulletinAuthor,
  BulletinKind,
  UpsertBulletinInput,
} from '@/types/bulletins';
import { isStaffAdminRole } from '@/types/role-taxonomy';

/**
 * سلسله‌مراتب انتشار اطلاعیه — اطلاعیهٔ هر پنل فقط در داشبورد نقش‌های زیرمجموعه‌اش دیده می‌شود.
 * نقش بدون زیرمجموعه (دانشجو، مهارت‌آموز) اطلاعیه منتشر نمی‌کند.
 * سطح نقش است، نه سازمان: دانشکده به همهٔ دانشجویان اعلام می‌کند تا Nest فیلتر سازمانی بدهد.
 */
const ANNOUNCEMENT_AUDIENCE: Record<UserRole, readonly UserRole[]> = {
  super_admin: [
    'assistant_admin',
    'central_organization',
    'provincial_university',
    'faculty_role',
    'regional_edu_admin',
    'school_principal',
    'supervisor_professor',
    'mentor_teacher',
    'student',
    'skill_learner',
  ],
  assistant_admin: [
    'central_organization',
    'provincial_university',
    'faculty_role',
    'regional_edu_admin',
    'school_principal',
    'supervisor_professor',
    'mentor_teacher',
    'student',
    'skill_learner',
  ],
  central_organization: [
    'provincial_university',
    'faculty_role',
    'regional_edu_admin',
    'school_principal',
    'supervisor_professor',
    'mentor_teacher',
    'student',
    'skill_learner',
  ],
  provincial_university: ['faculty_role', 'supervisor_professor', 'student'],
  faculty_role: ['supervisor_professor', 'student'],
  regional_edu_admin: ['school_principal', 'mentor_teacher', 'skill_learner'],
  school_principal: ['mentor_teacher', 'skill_learner'],
  supervisor_professor: ['student'],
  mentor_teacher: ['skill_learner'],
  student: [],
  skill_learner: [],
};

/** تبلیغ برای همهٔ پنل‌ها جز خود ستاد مدیریت. */
const ADVERTISEMENT_AUDIENCE: readonly UserRole[] =
  ANNOUNCEMENT_AUDIENCE.assistant_admin;

export const BULLETIN_TITLE_MAX = 120;
export const BULLETIN_BODY_MAX = 1000;

export function canPublishAdvertisements(
  role: UserRole | string | null | undefined
): boolean {
  return isStaffAdminRole(role);
}

export function audienceRolesFor(
  role: UserRole | string | null | undefined,
  kind: BulletinKind
): readonly UserRole[] {
  if (kind === 'advertisement') {
    return canPublishAdvertisements(role) ? ADVERTISEMENT_AUDIENCE : [];
  }
  if (!role || !Object.prototype.hasOwnProperty.call(ANNOUNCEMENT_AUDIENCE, role)) {
    return [];
  }
  return ANNOUNCEMENT_AUDIENCE[role as UserRole];
}

export function canPublishAnnouncements(
  role: UserRole | string | null | undefined
): boolean {
  return audienceRolesFor(role, 'announcement').length > 0;
}

/** نقش‌هایی که پنل اطلاعیه‌ها/تبلیغات در داشبوردشان معنا دارد (کسی بالادستشان منتشر می‌کند). */
export function canReceiveBulletins(
  role: UserRole | string | null | undefined
): boolean {
  if (!role) return false;
  return Object.values(ANNOUNCEMENT_AUDIENCE).some((audience) =>
    audience.includes(role as UserRole)
  );
}

/**
 * مالکیت پنل: مدیر ارشد و دستیار یک ستاد مشترک‌اند و موارد هم را مدیریت می‌کنند؛
 * بقیه فقط موارد نقش خودشان را.
 */
export function isBulletinOwnedBy(
  bulletin: Pick<Bulletin, 'authorRole'>,
  role: UserRole | string | null | undefined
): boolean {
  if (isStaffAdminRole(role)) return isStaffAdminRole(bulletin.authorRole);
  return bulletin.authorRole === role;
}

/**
 * آیا این مورد در داشبورد نقش بیننده دیده می‌شود؟ مخاطب ذخیره‌شده
 * دوباره با سلسله‌مراتب فعلی قطع داده می‌شود تا دادهٔ قدیمی به نقش بالادست نشت نکند.
 */
export function isBulletinVisibleTo(
  bulletin: Bulletin,
  viewerRole: UserRole | string | null | undefined
): boolean {
  if (!viewerRole) return false;
  const role = viewerRole as UserRole;
  if (!bulletin.audienceRoles.includes(role)) return false;
  return audienceRolesFor(bulletin.authorRole, bulletin.kind).includes(role);
}

/** جدیدترین اول. */
export function sortBulletins(rows: readonly Bulletin[]): Bulletin[] {
  return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/** پیام فارسی برای فرم؛ `null` یعنی ورودی معتبر است. */
export function validateBulletinInput(
  input: UpsertBulletinInput,
  authorRole: UserRole
): string | null {
  if (input.kind === 'advertisement' && !canPublishAdvertisements(authorRole)) {
    return 'انتشار تبلیغ فقط برای مدیر ارشد و دستیارانش مجاز است.';
  }
  const allowed = audienceRolesFor(authorRole, input.kind);
  if (allowed.length === 0) {
    return 'پنل شما زیرمجموعه‌ای برای انتشار اطلاعیه ندارد.';
  }
  const title = input.title.trim();
  if (!title) return 'عنوان الزامی است.';
  if (title.length > BULLETIN_TITLE_MAX) {
    return `عنوان حداکثر ${BULLETIN_TITLE_MAX} نویسه است.`;
  }
  const body = input.body.trim();
  const hasImage = input.kind === 'advertisement' && Boolean(input.imageUrl);
  // تبلیغ با تصویر می‌تواند بی‌متن باشد؛ اطلاعیه همیشه متن می‌خواهد.
  if (!body && !hasImage) {
    return input.kind === 'advertisement'
      ? 'متن یا تصویر تبلیغ را وارد کنید.'
      : 'متن الزامی است.';
  }
  if (body.length > BULLETIN_BODY_MAX) {
    return `متن حداکثر ${BULLETIN_BODY_MAX} نویسه است.`;
  }
  if (input.audienceRoles.length === 0) {
    return 'دست‌کم یک مخاطب انتخاب کنید.';
  }
  if (input.audienceRoles.some((role) => !allowed.includes(role))) {
    return 'مخاطب انتخاب‌شده زیرمجموعهٔ پنل شما نیست.';
  }
  const link = input.linkUrl?.trim();
  if (input.kind === 'advertisement' && link && !isSafeHttpUrl(link)) {
    return 'لینک باید با http:// یا https:// شروع شود.';
  }
  const image = input.imageUrl;
  if (
    input.kind === 'advertisement' &&
    image &&
    !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(image) &&
    !isSafeHttpUrl(image)
  ) {
    return 'فرمت تصویر تبلیغ معتبر نیست.';
  }
  return null;
}

function newBulletinId(): string {
  return `bul_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function buildBulletin(
  input: UpsertBulletinInput,
  author: BulletinAuthor,
  existing?: Bulletin,
  now: Date = new Date()
): Bulletin {
  const stamp = now.toISOString();
  const isAd = input.kind === 'advertisement';
  const link = isAd ? input.linkUrl?.trim() : '';
  const image = isAd ? input.imageUrl : '';
  // نویسنده/زمان ایجاد اصلی می‌ماند؛ ویرایش دستیار، تبلیغ مدیر ارشد را تصاحب نمی‌کند.
  return {
    id: existing?.id ?? newBulletinId(),
    kind: input.kind,
    title: input.title.trim(),
    body: input.body.trim(),
    ...(link ? { linkUrl: link } : {}),
    ...(image ? { imageUrl: image } : {}),
    authorRole: existing?.authorRole ?? author.role,
    authorName: existing?.authorName ?? author.name,
    audienceRoles: [...new Set(input.audienceRoles)],
    createdAt: existing?.createdAt ?? stamp,
    updatedAt: stamp,
  };
}
