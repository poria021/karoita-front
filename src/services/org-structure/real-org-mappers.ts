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
  NestProvince,
  NestRole,
  NestSchool,
  NestUniversity,
} from '@/types/nest-admin';
import type { OrgStructureListItem } from '@/services/org-structure/mock-org-query';

type ProvinceLike = Pick<NestProvince, 'id' | 'title'>;

/**
 * Real-mode (Nest) mappers — pure functions, no I/O. Split out of
 * org-structure.service.ts so the real-mode transformation logic lives
 * next to its own tests (real-org-mappers.test.ts), the same way mock
 * mode's logic lives in its own files under this folder.
 */

/** Nest Province → OrgProvince */
export function toOrgProvince(p: ProvinceLike): OrgProvince {
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
 * the دانشکده/پردیس tab). Same defensive shape handling as toOrgCity —
 * live GET sample was an empty array, so whether it nests `province`/`city`
 * objects or returns them flat is unconfirmed; accept both. */
export function toOrgFaculty(u: NestUniversity): OrgFaculty {
  return {
    id: u.id,
    name: u.title,
    provinceId: u.provinceId ?? u.province?.id ?? '',
    cityId: u.cityId ?? u.city?.id ?? '',
  };
}

/** Nest EducationalDistrict → OrgDistrict. Same defensive shape handling
 * as toOrgCity — not confirmed live yet, but educations link to
 * province+city the same way cities do, so a nested `province`/`city`
 * object instead of flat `provinceId`/`cityId` is equally plausible here. */
export function toOrgDistrict(d: NestEducationalDistrict): OrgDistrict {
  return {
    id: d.id,
    name: d.title,
    provinceId: d.provinceId ?? d.province_id ?? d.province?.id ?? '',
    cityId: d.cityId ?? d.city_id ?? d.city?.id ?? '',
  };
}

/** Nest School → OrgSchool. Same defensive shape handling as toOrgCity. */
export function toOrgSchool(s: NestSchool): OrgSchool {
  const gender =
    s.gender?.toLowerCase() === 'girl' || s.gender?.toLowerCase() === 'female'
      ? 'female'
      : 'male';
  return {
    id: s.id,
    name: s.title,
    provinceId: s.provinceId ?? s.province_id ?? s.province?.id ?? '',
    cityId: s.cityId ?? s.city_id ?? s.city?.id ?? '',
    districtId: s.educationId ?? s.education_id ?? s.education?.id ?? '',
    gender,
  };
}

/** Nest Degree (GET /admin/degreeee) → majors-tab list row. */
export function toOrgMajorListItem(d: NestDegree): OrgStructureListItem {
  return {
    id: d.id,
    name: d.title,
    kind: 'major' as const,
    deleteBlocked: false,
    roleName: d.role?.title,
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
 * GET /admin/roles has no `title`/`name` field on live responses — only
 * `{ id }` (see NestRole). Fall back to a short id-based label so the
 * majors-tab role <select> never renders a blank/undefined option.
 */
export function resolveRoleLabel(role: NestRole): string {
  const label = role.title?.trim();
  if (label) return label;
  return `نقش #${role.id.slice(-6)}`;
}
