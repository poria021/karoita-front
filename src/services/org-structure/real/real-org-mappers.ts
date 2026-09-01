import type {
  OrgCity,
  OrgDistrict,
  OrgFaculty,
  OrgProvince,
  OrgSchool,
} from '@/types/org-structure';
import type {
  NestDegree,
  NestDegreeByRole,
  NestEducationalDistrict,
  NestProvinceLite,
  NestSchool,
  NestUniversity,
} from '@/types/nest-admin';
import type { OrgStructureListItem } from '@/types/org-structure';
import { isLinkedUserDeleteBlocked } from '@/services/org-structure/org-structure-delete-rules';

/**
 * Mapperهای حالت real (Nest) — خالص، بدون I/O.
 * FK ممکن است رشته یا سند populated باشد.
 */

/** id قابل‌استفاده از FK رشته، سند `{ id, title }` / `{ _id, name }`، یا آرایه. */
export function nestRelationId(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (Array.isArray(value)) return nestRelationId(value[0]);
  if (!value || typeof value !== 'object') return '';
  const rec = value as Record<string, unknown>;
  const rawId = rec.id ?? rec._id;
  if (typeof rawId === 'string') return rawId.trim();
  if (typeof rawId === 'number' && Number.isFinite(rawId)) return String(rawId);
  if (rawId && typeof rawId === 'object') {
    const asString = String(rawId);
    if (asString && asString !== '[object Object]') return asString;
  }
  return '';
}

/** عنوان نمایشی از رابطهٔ populated (`title` یا `name`)؛ رشتهٔ خالی یعنی غایب. */
export function nestRelationTitle(value: unknown): string | undefined {
  if (Array.isArray(value)) return nestRelationTitle(value[0]);
  if (!value || typeof value !== 'object') return undefined;
  const rec = value as Record<string, unknown>;
  const raw = rec.title ?? rec.name;
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  return trimmed || undefined;
}

/** اولین عنوان غیرخالی بین کاندیدهای populated. */
export function firstRelationTitle(
  ...candidates: unknown[]
): string | undefined {
  for (const candidate of candidates) {
    const title = nestRelationTitle(candidate);
    if (title) return title;
  }
  return undefined;
}

/**
 * GET /admin/schools?educationId= واقعاً فیلتر می‌کند؛ بعضی queryهای خواهر نادیده گرفته می‌شوند.
 * فقط وقتی دو مقدار کاتالوگ یا بیشتر کل لیست را برگردانند فیلتر را نادیده بگیر.
 */
export function nestRelationFiltersIgnored(
  hitCounts: number[],
  totalCount: number
): boolean {
  if (totalCount <= 0 || hitCounts.length <= 1) return false;
  return hitCounts.filter((count) => count === totalCount).length > 1;
}

export function nestUsersCount(row: {
  usersCount?: number;
  userCount?: number;
  users_count?: number;
  users?: unknown;
}): number | undefined {
  const raw = row.usersCount ?? row.userCount ?? row.users_count;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) return raw;
  if (Array.isArray(row.users)) return row.users.length;
  return undefined;
}

export function toOrgProvince(p: NestProvinceLite): OrgProvince {
  return { id: p.id, name: p.title };
}

/** GET لایو `province` را آبجکت می‌گذارد (گاهی `{}`) نه `province_id` تختِ DTO نوشتن. */
export function toOrgCity(c: {
  id: string;
  title: string;
  province_id?: string;
  province?: { id?: string; title?: string } | null;
}): OrgCity {
  return {
    id: c.id,
    name: c.title,
    provinceId: nestRelationId(c.province_id) || nestRelationId(c.province) || '',
  };
}

/** university Nest همان تب پردیس است؛ استان لایو زیر `role` است نه `province`. */
export function toOrgFaculty(u: NestUniversity): OrgFaculty {
  return {
    id: u.id,
    name: u.title,
    provinceId:
      nestRelationId(u.provinceId) ||
      nestRelationId(u.province) ||
      nestRelationId(u.role) ||
      '',
    cityId:
      nestRelationId(u.cityId) ||
      nestRelationId(u.city_id) ||
      nestRelationId(u.city) ||
      '',
  };
}

/** GET `province`/`city` آبجکت‌اند؛ id تخت و snake_case فقط fallback است. */
export function toOrgDistrict(d: NestEducationalDistrict): OrgDistrict {
  return {
    id: d.id,
    name: d.title,
    provinceId:
      nestRelationId(d.provinceId) ||
      nestRelationId(d.province_id) ||
      nestRelationId(d.province) ||
      '',
    cityId:
      nestRelationId(d.cityId) ||
      nestRelationId(d.city_id) ||
      nestRelationId(d.city) ||
      '',
  };
}

/** جنسیت لایو `genderType` است نه `gender`. */
export function toOrgSchool(s: NestSchool): OrgSchool {
  const rawGender = (s.genderType ?? s.gender)?.toLowerCase();
  const gender = rawGender === 'girl' || rawGender === 'female' ? 'female' : 'male';
  return {
    id: s.id,
    name: s.title,
    provinceId:
      nestRelationId(s.provinceId) ||
      nestRelationId(s.province_id) ||
      nestRelationId(s.province) ||
      '',
    cityId:
      nestRelationId(s.cityId) ||
      nestRelationId(s.city_id) ||
      nestRelationId(s.city) ||
      '',
    districtId:
      nestRelationId(s.educationId) ||
      nestRelationId(s.education_id) ||
      nestRelationId(s.education) ||
      nestRelationId(s.educationalDistrict) ||
      nestRelationId(s.district) ||
      '',
    gender,
  };
}

/** GET /admin/degreeee → ردیف رشته؛ `roleName` باید `title_fa` باشد نه کلید انگلیسی. */
export function toOrgMajorListItem(d: NestDegree): OrgStructureListItem {
  const usersCount = nestUsersCount(d);
  return {
    id: d.id,
    name: d.title,
    kind: 'major' as const,
    usersCount,
    deleteBlocked: isLinkedUserDeleteBlocked('major', usersCount),
    roleName: d.role ? resolveRoleLabel(d.role) : undefined,
    roleId: d.roleId ?? d.role?.id,
  };
}

/** GET /admin/roles/{roleId}/degrees → ردیف رشتهٔ از قبل scoped. */
export function toOrgMajorListItemForRole(
  d: NestDegreeByRole,
  roleId: string
): OrgStructureListItem {
  const usersCount = nestUsersCount(d);
  return {
    id: d.id,
    name: d.title,
    kind: 'major' as const,
    usersCount,
    deleteBlocked: isLinkedUserDeleteBlocked('major', usersCount),
    roleId,
  };
}

/** `title_fa` برچسب فارسی است؛ `title` انگلیسی فقط اگر `title_fa` نباشد — join درجه گاهی `title_fa` ندارد. */
export function resolveRoleLabel(role: {
  id?: string;
  title?: string;
  title_fa?: string;
}): string {
  const persianLabel = role.title_fa?.trim();
  if (persianLabel) return persianLabel;

  // GET /admin/degreeee گاهی `title_fa` روی join نمی‌دهد.
  const englishLabel = role.title?.trim();
  if (englishLabel) return englishLabel;

  return role.id ? `نقش #${role.id.slice(-6)}` : 'بدون نقش';
}
