/**
 * `role` در POST/PATCH `/api/v1/admin/account-users` باید شناسهٔ نقش باشد نه اسم —
 * GET `/api/v1/admin/account-users/roles` شناسه می‌دهد. fallback هاردکد ممنوع؛
 * نقش اشتباه یعنی کاربر در سازمان اشتباه ثبت می‌شود.
 */
import { accountUsersApi } from '@/services/admin-user-creation/real/account-users.api';
import { ApiClientError } from '@/services/api-client';
import {
  nestRoleLabel,
  pickNestRoleDto,
  type NestRoleDto,
} from '@/services/auth/real/nest-auth-role';
import type { OrgManagementRole } from '@/types/role-taxonomy';

/**
 * TODO(temp-org-roles): بک‌اند dev فعلاً فقط ۳ نقش placeholder (`other1`/`other2`/`other3`)
 * برای نقش‌های سازمانی گذاشته، نه اسم واقعی نهایی. این override فقط وقتی استفاده میشه
 * که نقش واقعی (central_org/manager/...) تو لیست نبود — یعنی روی محیطی که بک‌اند
 * نقش‌های نهایی رو داره (یا تست‌ها که mock درست می‌دن)، بی‌اثره و همون مسیر اصلی
 * pickNestRoleDto اجرا میشه. `regional_edu_admin` عمداً اینجا نیست چون نقش چهارم
 * هنوز روی بک‌اند اضافه نشده. وقتی بک‌اند نهایی شد: این override و کل این بلاک حذف بشه.
 */
const TEMP_ORG_ROLE_TITLE_OVERRIDE: Partial<Record<OrgManagementRole, string>> = {
  central_organization: 'other1',
  provincial_university: 'other2',
  faculty_role: 'other3',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseOrganizationalRoleList(raw: unknown): NestRoleDto[] {
  const list = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray(raw.data)
      ? raw.data
      : null;
  if (!list) return [];

  const roles: NestRoleDto[] = [];
  for (const entry of list) {
    if (!isRecord(entry)) continue;
    if (typeof entry.id !== 'string' && typeof entry.id !== 'number') continue;
    const label = nestRoleLabel(entry);
    if (!label) continue;
    roles.push({ id: String(entry.id), name: label as NestRoleDto['name'] });
  }
  return roles;
}

/** GET /account-users/roles + دو تلاش برای خطای شبکهٔ گذرا؛ ۴xx بدون retry. */
export async function resolveOrganizationalRoleId(
  role: OrgManagementRole
): Promise<string> {
  const overrideTitle = TEMP_ORG_ROLE_TITLE_OVERRIDE[role];
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 400));

    try {
      const raw = await accountUsersApi.listRoles();
      const roles = parseOrganizationalRoleList(raw);
      if (roles.length === 0) {
        throw new Error('لیست نقش‌های سازمانی از سرور خالی یا نامعتبر بود.');
      }

      const overrideMatch = overrideTitle
        ? roles.find((entry) => entry.name === overrideTitle)
        : null;
      if (overrideMatch) {
        console.warn(
          `[account-users-role-lookup] TEMP: نقش «${role}» موقتاً به placeholder «${overrideTitle}» وصل شد تا نقش‌های واقعی از بک‌اند بیاد.`
        );
        return overrideMatch.id;
      }

      return pickNestRoleDto(roles, role).id;
    } catch (error) {
      lastError = error;
      if (
        error instanceof ApiClientError &&
        typeof error.status === 'number' &&
        error.status >= 400 &&
        error.status < 500
      ) {
        break;
      }
    }
  }

  console.error(
    '[account-users-role-lookup] resolveOrganizationalRoleId failed after retries',
    lastError
  );
  throw new ApiClientError(
    'دریافت شناسهٔ نقش سازمانی از سرور ناموفق بود. اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.'
  );
}
