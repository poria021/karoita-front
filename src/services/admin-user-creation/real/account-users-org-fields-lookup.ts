import { OrganizationOptionsService } from '@/services/organization-options.service';
import type { OrganizationField } from '@/utils/roleFieldStrategy';

/**
 * `KvSearchableOrganizationSelect` روی برچسب (label) کار می‌کند، ولی Nest در
 * POST/PATCH `/admin/account-users` برای province/city/educationDistrict شناسهٔ
 * mongodb می‌خواهد. fallback هاردکد ممنوع؛ استان/شهر/منطقهٔ اشتباه یعنی کاربر
 * در سازمان اشتباه ثبت می‌شود — برچسب پیدانشده باید صریح خطا بدهد.
 */
async function resolveOrgFieldId(
  type: OrganizationField,
  label: string | undefined,
  scope?: { province?: string; city?: string }
): Promise<string | undefined> {
  const trimmed = label?.trim();
  if (!trimmed) return undefined;

  const result = await OrganizationOptionsService.getOptions({
    type,
    query: trimmed,
    page: 1,
    limit: 25,
    province: scope?.province,
    city: scope?.city,
  });
  const exact = result.items.find((item) => item.label === trimmed);
  if (!exact) {
    throw new Error(`مقدار «${trimmed}» برای «${type}» در فهرست سرور یافت نشد.`);
  }
  return exact.id;
}

/** برچسب‌های استان/شهر/منطقهٔ فرم حساب سازمانی را به شناسهٔ واقعی Nest resolve می‌کند. */
export async function resolveOrgAccountLocationIds(input: {
  province?: string;
  city?: string;
  district?: string;
}): Promise<{ province?: string; city?: string; district?: string }> {
  const province = await resolveOrgFieldId('province', input.province);
  const [city, district] = await Promise.all([
    resolveOrgFieldId('city', input.city, { province }),
    resolveOrgFieldId('district', input.district, { province }),
  ]);
  return { province, city, district };
}
