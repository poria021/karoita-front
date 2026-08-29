import { fromNestRoleName } from '@/services/auth/real/nest-auth-role';
import type {
  StaffAdminAccount,
  StaffAdminsPage,
} from '@/types/admin-user-creation';
import type { NestAdminDto } from '@/types/nest-admins';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Nest list envelope is `{ data, hasNextPage }`. Bare arrays or missing
 * `data` must not crash the staff table.
 */
export function parseAdminsListResponse(raw: unknown): {
  data: NestAdminDto[];
  hasNextPage: boolean;
} {
  if (Array.isArray(raw)) {
    return {
      data: raw.filter(isRecord) as unknown as NestAdminDto[],
      hasNextPage: false,
    };
  }
  if (!isRecord(raw)) {
    return { data: [], hasNextPage: false };
  }
  const rows = Array.isArray(raw.data) ? raw.data : [];
  return {
    data: rows.filter(isRecord) as unknown as NestAdminDto[],
    hasNextPage: Boolean(raw.hasNextPage),
  };
}

export function mapNestAdminAccount(
  raw: NestAdminDto | Record<string, unknown>
): StaffAdminAccount | null {
  const row = raw as Record<string, unknown>;
  const id = asString(row.id);
  if (!id) return null;

  const statusName = isRecord(row.status) ? asString(row.status.name) : '';
  const roleName = asString(row.role);

  return {
    id,
    firstName: asString(row.fname),
    lastName: asString(row.lname),
    mobile: asString(row.phone),
    role: roleName ? fromNestRoleName(roleName) : 'assistant_admin',
    statusName: statusName || 'active',
    createdAt: asString(row.createdAt),
  };
}

export function mapAdminsPage(raw: unknown): StaffAdminsPage {
  const parsed = parseAdminsListResponse(raw);
  return {
    data: parsed.data
      .map((row) => mapNestAdminAccount(row))
      .filter((item): item is StaffAdminAccount => item !== null),
    hasNextPage: parsed.hasNextPage,
  };
}
