import type { Options as KyOptions } from 'ky';

export function toSearchParams(
  query: Record<string, string | number | undefined>
): NonNullable<KyOptions['searchParams']> {
  const params: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '') continue;
    params[key] = value;
  }
  return params;
}

/**
 * Nest روی `GET /admin/provinces` و `/admin/cities` مقدار `filters` را
 * `JSON.parse` می‌کند. بدون این کلید بدنهٔ parse می‌ترکد و پروکسی ۵۰۰ می‌دهد.
 */
export function toNestTitleFilterSearchParams(query: {
  page?: number;
  limit?: number;
  filters?: string;
}): NonNullable<KyOptions['searchParams']> {
  const { filters, ...rest } = query;
  return toSearchParams({
    ...rest,
    filters: JSON.stringify(filters ? { title: filters } : {}),
  });
}
