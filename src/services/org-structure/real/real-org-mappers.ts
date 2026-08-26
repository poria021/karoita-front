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

/**
 * Real-mode (Nest) mappers — pure functions, no I/O. Split out of
 * org-structure.service.ts so the real-mode transformation logic lives
 * next to its own tests (real-org-mappers.test.ts), the same way mock
 * mode's logic lives in its own files under this folder.
 */

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
    provinceId: c.province_id ?? c.province?.id ?? '',
  };
}

/** Nest University → OrgFaculty ('university' is the Nest entity behind
 * the دانشکده/پردیس tab). Confirmed live quirk: GET rows nest the linked
 * province under `role`, not `province` (see NestUniversity) — `role` is
 * checked last, only as a fallback, so a future backend fix to the
 * correctly-named `province` field keeps working without a code change. */
export function toOrgFaculty(u: NestUniversity): OrgFaculty {
  return {
    id: u.id,
    name: u.title,
    provinceId: u.provinceId ?? u.province?.id ?? u.role?.id ?? '',
    cityId: u.cityId ?? u.city?.id ?? '',
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
    provinceId: d.provinceId ?? d.province_id ?? d.province?.id ?? '',
    cityId: d.cityId ?? d.city_id ?? d.city?.id ?? '',
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
    provinceId: s.provinceId ?? s.province_id ?? s.province?.id ?? '',
    cityId: s.cityId ?? s.city_id ?? s.city?.id ?? '',
    districtId: s.educationId ?? s.education_id ?? s.education?.id ?? '',
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
  return {
    id: d.id,
    name: d.title,
    kind: 'major' as const,
    deleteBlocked: false,
    roleName: d.role ? resolveRoleLabel(d.role) : undefined,
    roleId: d.roleId ?? d.role?.id,
  };
}

/** Nest Degree (GET /admin/roles/{roleId}/degrees) → majors-tab list row, already scoped to `roleId`. */
export function toOrgMajorListItemForRole(
  d: NestDegreeByRole,
  roleId: string
): OrgStructureListItem {
  return {
    id: d.id,
    name: d.title,
    kind: 'major' as const,
    deleteBlocked: false,
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
