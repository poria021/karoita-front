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
