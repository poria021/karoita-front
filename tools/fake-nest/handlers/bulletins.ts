/**
 * اطلاعیه‌ها و تبلیغات + فهرست استان‌ها (برای انتخاب مخاطب).
 *
 * ⚠️ مسیرهای `/api/v1/bulletins*` در Swagger بک‌اند نیستند؛ قرارداد پیشنهادی فرانت
 * در `openapi.proposed.json` است (جدا از snapshot تا sync پاکش نکند). وقتی بک‌اند
 * همین مسیرها را منتشر کرد، از آن فایل حذف شوند و این handler با Swagger واقعی تطبیق داده شود.
 *
 * نقش‌ها همان نام‌های Nest هستند (`superadmin`، `mentor`، `trainee`، …)؛ تبدیل به نقش
 * فرانت در `src/services/bulletins/real/` انجام می‌شود. فیلتر استانیِ بیننده اینجا اعمال
 * نمی‌شود چون کاربران seed استان ندارند — مخاطب استانی فقط ذخیره و برگردانده می‌شود.
 */
import { HttpError, noContent, ok } from '../http';
import type { Router } from '../router';
import { newId, nowIso, type Session, type Store, type StoredBulletin } from '../store';

type Actor = { role: string; name: string };

const STAFF_ROLES = new Set(['superadmin', 'admin']);

/** تبلیغ برای همهٔ پنل‌ها جز خود ستاد مدیریت. */
const AD_AUDIENCE = [
  'organization_center',
  'university_province',
  'university',
  'school_district',
  'school_admin',
  'mentor',
  'teacher',
  'student',
  'trainee',
];

/** سلسله‌مراتب انتشار اطلاعیه (هم‌ارز `ANNOUNCEMENT_AUDIENCE` فرانت، با نام نقش‌های Nest). */
const ANNOUNCEMENT_AUDIENCE: Record<string, readonly string[]> = {
  superadmin: ['admin', ...AD_AUDIENCE],
  admin: AD_AUDIENCE,
  organization_center: AD_AUDIENCE,
  university_province: ['university', 'mentor', 'student'],
  university: ['mentor', 'student'],
  school_district: ['school_admin', 'teacher', 'trainee'],
  school_admin: ['teacher', 'trainee'],
  mentor: ['student'],
  teacher: ['trainee'],
  student: [],
  trainee: [],
};

const TITLE_MAX = 120;
const BODY_MAX = 1000;

function audienceFor(role: string, kind: StoredBulletin['kind']): readonly string[] {
  if (kind === 'advertisement') return STAFF_ROLES.has(role) ? AD_AUDIENCE : [];
  return ANNOUNCEMENT_AUDIENCE[role] ?? [];
}

function actorOf(store: Store, session: Session | null, fakeActor?: Actor): Actor {
  if (!session && fakeActor) return fakeActor;
  if (!session) throw new HttpError(401, 'Unauthorized');
  if (session.surface === 'admin') {
    const admin = store.admins.get(session.accountId);
    if (!admin) throw new HttpError(401, 'Unauthorized');
    return { role: admin.role, name: `${admin.fname} ${admin.lname}`.trim() };
  }
  const user = store.users.get(session.accountId);
  if (!user) throw new HttpError(401, 'Unauthorized');
  return { role: user.roleName, name: `${user.firstName} ${user.lastName}`.trim() };
}

/** ستاد (مدیر ارشد + دستیار) یک پنل مشترک‌اند؛ بقیه فقط موارد نقش خودشان. */
function isOwnedBy(row: StoredBulletin, role: string): boolean {
  if (STAFF_ROLES.has(role)) return STAFF_ROLES.has(row.authorRole);
  return row.authorRole === role;
}

function isVisibleTo(row: StoredBulletin, role: string): boolean {
  return (
    row.isActive &&
    row.audienceRoles.includes(role) &&
    audienceFor(row.authorRole, row.kind).includes(role)
  );
}

type UpsertBody = {
  kind: StoredBulletin['kind'];
  title: string;
  body: string;
  linkUrl?: string | null;
  imageUrl?: string | null;
  audienceRoles: string[];
  provinces: string[];
};

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** قواعد دامنه‌ای که Swagger بیان نمی‌کند (بک‌اند واقعی هم باید اعمال کند). */
function assertValid(input: UpsertBody, authorRole: string): void {
  if (input.kind === 'advertisement' && !STAFF_ROLES.has(authorRole)) {
    throw new HttpError(403, 'Only staff admins can publish advertisements');
  }
  const allowed = audienceFor(authorRole, input.kind);
  if (allowed.length === 0) {
    throw new HttpError(403, 'This panel has no sub-roles to publish to');
  }
  const title = input.title.trim();
  const body = input.body.trim();
  const errors: Record<string, string> = {};
  if (!title) errors.title = 'title is required';
  else if (title.length > TITLE_MAX) errors.title = `title max ${TITLE_MAX} chars`;
  if (input.kind === 'announcement' && !body) errors.body = 'body is required';
  if (input.kind === 'advertisement' && !body && !input.imageUrl) {
    errors.body = 'description or image is required';
  }
  if (body.length > BODY_MAX) errors.body = `body max ${BODY_MAX} chars`;
  if (input.audienceRoles.length === 0) errors.audienceRoles = 'at least one audience role';
  else if (input.audienceRoles.some((role) => !allowed.includes(role))) {
    errors.audienceRoles = 'audience is outside your sub-roles';
  }
  // فقط ستاد مخاطب استانی دارد؛ بقیهٔ پنل‌ها استان نمی‌فرستند.
  if (STAFF_ROLES.has(authorRole) && input.provinces.length === 0) {
    errors.provinces = 'at least one province';
  }
  const link = input.linkUrl?.trim();
  if (input.kind === 'advertisement' && link && !isHttpUrl(link)) {
    errors.linkUrl = 'link must start with http:// or https://';
  }
  if (Object.keys(errors).length > 0) {
    throw new HttpError(422, 'Unprocessable Entity', errors);
  }
}

function dto(row: StoredBulletin) {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    ...(row.linkUrl ? { linkUrl: row.linkUrl } : {}),
    ...(row.imageUrl ? { imageUrl: row.imageUrl } : {}),
    authorRole: row.authorRole,
    authorName: row.authorName,
    audienceRoles: row.audienceRoles,
    provinces: row.provinces,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function newestFirst(rows: StoredBulletin[]): StoredBulletin[] {
  return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function applyInput(
  input: UpsertBody,
  base: Pick<StoredBulletin, 'id' | 'authorRole' | 'authorName' | 'isActive' | 'createdAt'>
): StoredBulletin {
  const isAd = input.kind === 'advertisement';
  const link = isAd ? input.linkUrl?.trim() : '';
  return {
    ...base,
    kind: input.kind,
    title: input.title.trim(),
    body: input.body.trim(),
    ...(link ? { linkUrl: link } : {}),
    ...(isAd && input.imageUrl ? { imageUrl: input.imageUrl } : {}),
    audienceRoles: [...new Set(input.audienceRoles)],
    provinces: STAFF_ROLES.has(base.authorRole)
      ? [...new Set(input.provinces.map((title) => title.trim()).filter(Boolean))]
      : [],
    updatedAt: nowIso(),
  };
}

export function registerBulletinRoutes(router: Router, store: Store): void {
  const findOwned = (id: string, role: string): StoredBulletin => {
    const row = store.bulletins.find((item) => item.id === id);
    if (!row || !isOwnedBy(row, role)) throw new HttpError(404, 'Bulletin not found');
    return row;
  };

  router.register('get', '/api/v1/bulletins', (context) => {
    const actor = actorOf(store, context.session, context.fakeActor);
    return ok(newestFirst(store.bulletins.filter((row) => isVisibleTo(row, actor.role))).map(dto));
  });

  router.register('get', '/api/v1/bulletins/managed', (context) => {
    const actor = actorOf(store, context.session, context.fakeActor);
    return ok(newestFirst(store.bulletins.filter((row) => isOwnedBy(row, actor.role))).map(dto));
  });

  router.register('post', '/api/v1/bulletins', (context) => {
    const actor = actorOf(store, context.session, context.fakeActor);
    const input = context.body as UpsertBody;
    assertValid(input, actor.role);
    const now = nowIso();
    const row = applyInput(input, {
      id: newId(),
      authorRole: actor.role,
      authorName: actor.name,
      isActive: true,
      createdAt: now,
    });
    store.bulletins.push(row);
    return ok(dto(row), 201);
  });

  router.register('patch', '/api/v1/bulletins/{id}', (context) => {
    const actor = actorOf(store, context.session, context.fakeActor);
    const existing = findOwned(context.params.id!, actor.role);
    const input = context.body as UpsertBody;
    if (existing.kind !== input.kind) {
      throw new HttpError(400, 'Bulletin kind cannot be changed');
    }
    // با نقش منتشرکنندهٔ اصلی اعتبارسنجی می‌شود تا مخاطب از سلسله‌مراتب او بیرون نرود.
    assertValid(input, existing.authorRole);
    const next = applyInput(input, existing);
    store.bulletins.splice(store.bulletins.indexOf(existing), 1, next);
    return ok(dto(next));
  });

  router.register('patch', '/api/v1/bulletins/{id}/active', (context) => {
    const actor = actorOf(store, context.session, context.fakeActor);
    const existing = findOwned(context.params.id!, actor.role);
    const { isActive } = context.body as { isActive: boolean };
    existing.isActive = isActive;
    existing.updatedAt = nowIso();
    return ok(dto(existing));
  });

  router.register('delete', '/api/v1/bulletins/{id}', (context) => {
    const actor = actorOf(store, context.session, context.fakeActor);
    const existing = findOwned(context.params.id!, actor.role);
    store.bulletins.splice(store.bulletins.indexOf(existing), 1);
    return noContent();
  });

  // Swagger: GET /api/admin/province/all?title= — آرایهٔ ساده `{ id, title }`.
  router.register('get', '/api/admin/province/all', (context) => {
    const title = context.query.get('title')?.trim();
    return ok(
      [...store.provinces.values()]
        .filter((row) => !title || row.title.includes(title))
        .map(({ id, title: rowTitle }) => ({ id, title: rowTitle }))
    );
  });
}
