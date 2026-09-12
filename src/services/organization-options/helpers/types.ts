import type { UserRole } from '@/types/auth';
import type { OrganizationField } from '@/utils/roleFieldStrategy';

export const ORGANIZATION_OPTIONS_DEFAULT_LIMIT = 10;

export type OrganizationOption = {
  id: string;
  label: string;
};

export type OrganizationOptionsResult = {
  items: OrganizationOption[];
  hasMore: boolean;
  page: number;
};

export type OrganizationOptionsQuery = {
  type: OrganizationField;
  query?: string;
  page?: number;
  limit?: number;
  /** نام استان(ها) — برای scope شهر/منطقه/مدرسه/دانشگاه. */
  province?: string | string[];
  /** نام شهر(ها) — برای scope منطقه و مدرسه. */
  city?: string | string[];
  /** نام منطقه(ها) — برای scope مدرسه. */
  district?: string | string[];
  /** نقش کاربر — رشته از GET /admin/roles/{roleId}/degrees نه کاتالوگ سراسری /admin/degreeee. */
  role?: UserRole;
  signal?: AbortSignal;
};

export type ResolvedOptionsRequest = Required<
  Pick<OrganizationOptionsQuery, 'type' | 'page' | 'limit'>
> &
  Pick<
    OrganizationOptionsQuery,
    'query' | 'province' | 'city' | 'district' | 'role' | 'signal'
  >;

export class OrganizationOptionsServiceError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'OrganizationOptionsServiceError';
  }
}

export function toNameList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

export function dedupeOptions(items: OrganizationOption[]): OrganizationOption[] {
  const seen = new Set<string>();
  const merged: OrganizationOption[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }
  return merged;
}

export function filterByQuery(
  items: OrganizationOption[],
  query: string
): OrganizationOption[] {
  const normalized = query.trim();
  if (!normalized) return items;
  return items.filter((item) => item.label.includes(normalized));
}

export function paginateBare(
  items: OrganizationOption[],
  page: number,
  limit: number
): OrganizationOptionsResult {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const start = (safePage - 1) * safeLimit;
  const slice = items.slice(start, start + safeLimit);
  return {
    items: slice,
    hasMore: start + slice.length < items.length,
    page: safePage,
  };
}
