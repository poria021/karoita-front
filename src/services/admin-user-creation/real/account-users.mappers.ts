import { fromNestRoleName } from '@/services/auth/real/nest-auth-role';
import type { User } from '@/types/auth';
import type { NestAccountUserDto } from '@/types/nest-account-users';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readTitles(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const titles = value
    .map((item) => (isRecord(item) ? asString(item.title) : ''))
    .filter(Boolean);
  return titles.length > 0 ? titles : undefined;
}

/**
 * پاسخ POST/GET/PATCH `/api/v1/admin/account-users` → `User` فرانت.
 * این حساب‌ها مستقیماً توسط ادمین ساخته می‌شوند و چرخهٔ تایید مدرک ندارند؛
 * برخلاف `documentStatus` کاربران عمومی، `status.name` اینجا فقط active/inactive است.
 */
export function mapNestAccountUser(
  raw: NestAccountUserDto | Record<string, unknown>,
  fallbackMobile?: string
): User {
  const row = raw as Record<string, unknown>;
  const id = asString(row.id);
  if (!id) {
    throw new Error('پاسخ حساب کاربری سازمانی نامعتبر است.');
  }

  const roleInfo = isRecord(row.role) ? row.role : null;
  const roleName = roleInfo ? asString(roleInfo.name) : '';

  const status = isRecord(row.status) ? row.status : null;
  const statusName = status ? asString(status.name).toLowerCase() : '';

  const mobile = asString(row.phone) || fallbackMobile?.trim() || '';

  return {
    id,
    firstName: asString(row.firstName),
    lastName: asString(row.lastName),
    mobile,
    role: roleName ? fromNestRoleName(roleName) : 'central_organization',
    approved: statusName ? statusName === 'active' : true,
    docStatus: 'approved',
    hasPassword: true,
    city: readTitles(row.city),
    district: readTitles(row.educationalDistrict),
    school: readTitles(row.school),
  };
}

export function mapAccountUsersPage(rows: readonly NestAccountUserDto[]): User[] {
  return rows.map((row) => mapNestAccountUser(row));
}
