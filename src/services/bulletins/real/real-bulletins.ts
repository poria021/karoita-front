import { apiClient } from '@/services/api-client';
import {
  fromNestRoleName,
  isStaffAdminRole,
  toNestAdminAccountRole,
  toNestRoleName,
} from '@/services/auth/real/nest-auth-role';
import { sortBulletins } from '@/services/bulletins/bulletin-rules';
import type { UserRole } from '@/types/auth';
import type { Bulletin, BulletinKind, UpsertBulletinInput } from '@/types/bulletins';

/**
 * اطلاعیه/تبلیغ روی Nest. مسیرها نسبت به `NEXT_PUBLIC_API_URL` (`.../api`) هستند.
 *
 * ⚠️ این endpointها هنوز در Swagger بک‌اند نیستند؛ قرارداد پیشنهادی در
 * `tools/fake-nest/openapi.proposed.json` است و سرور جعلی (`pnpm fake-api`) آن را سرو می‌کند.
 * وقتی بک‌اند شکل دیگری منتشر کرد، فقط این فایل (و mapperها) عوض شود؛ شکل Facade ثابت می‌ماند.
 */
export const NEST_BULLETINS_PATHS = {
  list: 'v1/bulletins',
  managed: 'v1/bulletins/managed',
  byId: (id: string) => `v1/bulletins/${id}`,
  active: (id: string) => `v1/bulletins/${id}/active`,
} as const;

type NestBulletin = {
  id: string;
  kind: BulletinKind;
  title: string;
  body: string;
  linkUrl?: string | null;
  imageUrl?: string | null;
  authorRole: string;
  authorName: string;
  audienceRoles: string[];
  provinces: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/** ستاد روی Nest `admin`/`superadmin` است؛ بقیه نام‌های عادی نقش. */
function toNestBulletinRole(role: UserRole): string {
  return isStaffAdminRole(role) ? toNestAdminAccountRole(role) : toNestRoleName(role);
}

export function mapNestBulletin(row: NestBulletin): Bulletin {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    ...(row.linkUrl ? { linkUrl: row.linkUrl } : {}),
    ...(row.imageUrl ? { imageUrl: row.imageUrl } : {}),
    authorRole: fromNestRoleName(row.authorRole),
    authorName: row.authorName,
    audienceRoles: row.audienceRoles.map(fromNestRoleName),
    provinces: row.provinces ?? [],
    isActive: row.isActive !== false,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toNestBody(input: UpsertBulletinInput) {
  return {
    kind: input.kind,
    title: input.title,
    body: input.body,
    ...(input.linkUrl ? { linkUrl: input.linkUrl } : {}),
    ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
    audienceRoles: input.audienceRoles.map(toNestBulletinRole),
    provinces: input.provinces,
  };
}

export async function listRealDashboardBulletins(): Promise<Bulletin[]> {
  const rows = await apiClient.getJson<NestBulletin[]>(NEST_BULLETINS_PATHS.list);
  return sortBulletins(rows.map(mapNestBulletin));
}

export async function listRealManagedBulletins(): Promise<Bulletin[]> {
  const rows = await apiClient.getJson<NestBulletin[]>(NEST_BULLETINS_PATHS.managed);
  return sortBulletins(rows.map(mapNestBulletin));
}

export async function createRealBulletin(
  input: UpsertBulletinInput
): Promise<Bulletin> {
  const row = await apiClient.postJson<NestBulletin>(
    NEST_BULLETINS_PATHS.list,
    toNestBody(input)
  );
  return mapNestBulletin(row);
}

export async function updateRealBulletin(
  id: string,
  input: UpsertBulletinInput
): Promise<Bulletin> {
  const row = await apiClient.patchJson<NestBulletin>(
    NEST_BULLETINS_PATHS.byId(id),
    toNestBody(input)
  );
  return mapNestBulletin(row);
}

export async function setRealBulletinActive(
  id: string,
  isActive: boolean
): Promise<Bulletin> {
  const row = await apiClient.patchJson<NestBulletin>(
    NEST_BULLETINS_PATHS.active(id),
    { isActive }
  );
  return mapNestBulletin(row);
}

export async function deleteRealBulletin(id: string): Promise<void> {
  await apiClient.deleteMaybeJson<null>(NEST_BULLETINS_PATHS.byId(id));
}

/** عنوان استان‌ها برای انتخاب مخاطب — از کاتالوگ ادمین Nest (`GET /admin/province/all`). */
export async function listRealProvinceTitles(): Promise<string[]> {
  const { adminCatalogApi } = await import(
    '@/services/admin-catalog/admin-catalog.api'
  );
  const provinces = await adminCatalogApi.getAllProvinces();
  return [...new Set(provinces.map((province) => province.title))];
}
