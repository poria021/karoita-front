/**
 * ورود/نشست ادمین و کاربر. توکن‌ها ناشفاف و فقط در حافظه‌اند؛ refresh هر بار
 * چرخانده می‌شود (توکن قبلی باطل) مثل رفتار Nest که فرانت روی آن حساب می‌کند.
 */
import { HttpError, noContent, ok, type RouteContext } from '../http';
import type { Router } from '../router';
import { seedRoles } from '../seed';
import {
  newId,
  nowIso,
  type AccountSurface,
  type Store,
  type StoredAdmin,
  type StoredUser,
} from '../store';

const ACCESS_TTL_MS = 15 * 60 * 1000;

/** `09123…` و `9123…` یکی حساب می‌شوند. */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').replace(/^0+/, '');
}

function issueTokens(
  store: Store,
  surface: AccountSurface,
  accountId: string
): { token: string; refreshToken: string; tokenExpires: number } {
  const token = `fake-access-${newId()}`;
  const refreshToken = `fake-refresh-${newId()}`;
  store.sessions.set(token, { surface, accountId, kind: 'access' });
  store.sessions.set(refreshToken, { surface, accountId, kind: 'refresh' });
  return { token, refreshToken, tokenExpires: Date.now() + ACCESS_TTL_MS };
}

function revokeAccount(store: Store, surface: AccountSurface, accountId: string) {
  for (const [token, session] of store.sessions) {
    if (session.surface === surface && session.accountId === accountId) {
      store.sessions.delete(token);
    }
  }
}

function adminDto(admin: StoredAdmin) {
  const now = nowIso();
  return {
    id: admin.id,
    fname: admin.fname,
    lname: admin.lname,
    phone: admin.phone,
    status: { id: 'active-status', name: 'active' },
    role: admin.role,
    createdAt: now,
    updatedAt: now,
  };
}

export function userDto(user: StoredUser) {
  const now = nowIso();
  return {
    id: user.id,
    phone: user.phone,
    provider: 'phone',
    socialId: '',
    firstName: user.firstName,
    lastName: user.lastName,
    photo: null,
    role: { id: user.roleId, name: user.roleName, is_other_role: false },
    status: { id: 'active-status', name: 'active' },
    userUniqueId: '1234567',
    city: [],
    educationalDistrict: [],
    school: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    // فیلدهای لایو که در Swagger نیامده ولی `mapNestAuthUser` می‌خواند:
    documentStatus: 'CONFIRM',
    hasPassword: true,
  };
}

function incorrectCredentials(): never {
  throw new HttpError(422, 'Unprocessable Entity', {
    password: 'incorrectPassword',
  });
}

function requireAccount<T>(
  surface: AccountSurface,
  context: RouteContext,
  find: (accountId: string) => T | undefined
): T {
  const session = context.session;
  if (!session || session.surface !== surface) {
    throw new HttpError(403, 'Forbidden');
  }
  const account = find(session.accountId);
  if (!account) throw new HttpError(401, 'Unauthorized');
  return account;
}

type PhonePasswordBody = { phone: string; password: string };

export function registerAuthRoutes(router: Router, store: Store): void {
  // ─── ادمین ───
  router.register('post', '/api/v1/admin/auth/phone/login/password', (context) => {
    const { phone, password } = context.body as PhonePasswordBody;
    const admin = [...store.admins.values()].find(
      (row) => normalizePhone(row.phone) === normalizePhone(phone)
    );
    if (!admin || admin.password !== password) incorrectCredentials();
    return ok({ ...issueTokens(store, 'admin', admin.id), admin: adminDto(admin) });
  });

  router.register('get', '/api/v1/admin/auth/me', (context) => {
    const admin = requireAccount('admin', context, (id) => store.admins.get(id));
    return ok(adminDto(admin));
  });

  router.register('post', '/api/v1/admin/auth/refresh', (context) => {
    const admin = requireAccount('admin', context, (id) => store.admins.get(id));
    revokeAccount(store, 'admin', admin.id);
    return ok(issueTokens(store, 'admin', admin.id));
  });

  router.register('post', '/api/v1/admin/auth/logout', (context) => {
    if (context.session) {
      revokeAccount(store, context.session.surface, context.session.accountId);
    }
    return noContent();
  });

  // ─── کاربر ───
  router.register('post', '/api/v1/auth/phone/login/password', (context) => {
    const { phone, password } = context.body as PhonePasswordBody;
    const user = [...store.users.values()].find(
      (row) => normalizePhone(row.phone) === normalizePhone(phone)
    );
    if (!user || user.password !== password) incorrectCredentials();
    return ok({ ...issueTokens(store, 'user', user.id), user: userDto(user) });
  });

  router.register('get', '/api/v1/auth/me', (context) => {
    const user = requireAccount('user', context, (id) => store.users.get(id));
    return ok(userDto(user));
  });

  router.register('post', '/api/v1/auth/refresh', (context) => {
    const user = requireAccount('user', context, (id) => store.users.get(id));
    revokeAccount(store, 'user', user.id);
    return ok(issueTokens(store, 'user', user.id));
  });

  router.register('post', '/api/v1/auth/logout', (context) => {
    if (context.session) {
      revokeAccount(store, context.session.surface, context.session.accountId);
    }
    return noContent();
  });

  router.register('get', '/api/v1/auth/roles', () => ok(seedRoles()));
}
