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
 * Real-mode (Nest) mappers — pure functions, no I/O. Split out of
 * org-structure.service.ts so the real-mode transformation logic lives
 * next to its own tests (real-org-mappers.test.ts), the same way mock
 * mode's logic lives in its own files under this folder.
 */

/**
 * Pull a usable id out of a Nest FK that may be a string, a populated
 * `{ id, title }` / `{ _id, name }` document, or an array of those.
 * Empty / whitespace-only strings are treated as absent.
 */
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

/**
 * Pull a display title out of a populated Nest relation. Accepts `title`
 * or `name`, nested arrays (first element), and treats blank strings as
 * absent so the caller can fall through to the next candidate.
 */
export function nestRelationTitle(value: unknown): string | undefined {
  if (Array.isArray(value)) return nestRelationTitle(value[0]);
  if (!value || typeof value !== 'object') return undefined;
  const rec = value as Record<string, unknown>;
  const raw = rec.title ?? rec.name;
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  return trimmed || undefined;
}

/** First non-empty title among populated-relation candidates. */
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
 * GET /admin/schools?educationId= actually filters. Some sibling query
 * params are ignored and return the full list for every catalog value.
 * Only treat the filter as ignored when TWO OR MORE catalog values each
 * return the entire school list — a single district owning every school
 * (or a 1-school catalog) is a real assignment, not an ignored param.
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

/** Nest Province → OrgProvince */
export function toOrgProvince(p: NestProvinceLite): OrgProvince {
  return { id: p.id, name: p.title };
}

/** Nest City → OrgCity. Live GET responses nest `province: { id, ... }`
 * (sometimes `{}`) instead of the flat `province_id` the Swagger schema
 * doc and create/update DTOs use — try both. */
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

/** Nest University → OrgFaculty ('university' is the Nest entity behind
 * the دانشکده/پردیس tab). Confirmed live quirk: GET rows nest the linked
 * province under `role`, not `province` (see NestUniversity) — `role` is
 * checked last, only as a fallback, so a future backend fix to the
 * correctly-named `province` field keeps working without a code change.
 * City may be a string FK or a populated `{ id, title }` on `cityId`. */
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

/** Nest EducationalDistrict → OrgDistrict. Confirmed live: rows nest
 * `province`/`city` as objects, same as toOrgCity — the flat
 * `provinceId`/`cityId` (create/update DTO shape) and snake_case variants
 * are kept as defensive fallbacks. */
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

/**
 * Nest School → OrgSchool. Same defensive shape handling as toOrgCity.
 * Confirmed live quirk: GET rows report gender as `genderType`, not
 * `gender` (see NestSchool) — `gender` is checked second only as a
 * defensive fallback.
 */
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

/**
 * Nest Degree (GET /admin/degreeee) → majors-tab list row.
 * `roleName` must prefer the linked role's Persian `title_fa` — this app
 * is Persian-only — the same preference resolveRoleLabel() already
 * applies for the role <select>. Using `d.role?.title` directly (as
 * before) rendered the English role key (e.g. "trainee") in the table
 * instead of the Persian label (e.g. "کارآموز").
 */
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

/** Nest Degree (GET /admin/roles/{roleId}/degrees) → majors-tab list row, already scoped to `roleId`. */
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

/**
 * GET /admin/roles returns `{ id, title, title_fa }` — `title_fa` is the
 * Persian display label and is strongly preferred since this UI is Persian.
 * `title` (the English role key, e.g. `"trainee"`) is a last-resort fallback
 * only when `title_fa` is genuinely absent or empty from the API response.
 *
 * If the table shows English role names despite this, the root cause is that
 * the Nest API is not returning `title_fa` on GET /admin/degreeee rows —
 * file a backend task to populate `title_fa` on the role join in that
 * endpoint. The frontend correctly prefers `title_fa` whenever it exists.
 */
export function resolveRoleLabel(role: {
  id?: string;
  title?: string;
  title_fa?: string;
}): string {
  // اولویت قطعی با title_fa (فارسی) — اگر خالی بود، به title (انگلیسی) فالبک کن.
  const persianLabel = role.title_fa?.trim();
  if (persianLabel) return persianLabel;

  // fallback: API روی GET /admin/degreeee برخی وقت‌ها title_fa رو برنمی‌گردونه.
  // در این صورت title (انگلیسی) نشون داده می‌شه — راه‌حل پایدار: بکنند
  // backend title_fa رو روی degree-role join در GET /admin/degreeee پر کند.
  const englishLabel = role.title?.trim();
  if (englishLabel) return englishLabel;

  return role.id ? `نقش #${role.id.slice(-6)}` : 'بدون نقش';
}
