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

/** پاکت لیست `{ data, hasNextPage }` است؛ آرایهٔ خام یا `data` غایب جدول را نترکاند. */
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

  const status = isRecord(row.status) ? row.status : null;
  const statusName = status ? asString(status.name) : '';
  const statusCode = readStatusCode(status);
  const roleName = asString(row.role);

  return {
    id,
    firstName: asString(row.fname),
    lastName: asString(row.lname),
    mobile: asString(row.phone),
    role: roleName ? fromNestRoleName(roleName) : 'assistant_admin',
    statusName: statusName || 'active',
    ...(statusCode !== undefined ? { statusCode } : {}),
    createdAt: asString(row.createdAt),
  };
}

/** PUT می‌خواهد عدد؛ id رشته‌ای غیرعددی (مثل st-1) را دور می‌اندازیم. */
function readStatusCode(
  status: Record<string, unknown> | null
): number | undefined {
  if (!status) return undefined;
  if (typeof status.id === 'number' && Number.isFinite(status.id)) {
    return status.id;
  }
  if (typeof status.id === 'string' && /^\d+$/.test(status.id)) {
    return Number(status.id);
  }
  return undefined;
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
