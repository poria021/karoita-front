/**
 * Server-only HTTP utility for Next.js Server Components / Route Handlers.
 *
 * چرا این فایل وجود دارد و چرا از apiClient استفاده نمی‌شود:
 * apiClient روی ky ساخته شده (browser-optimised: credentials:include، in-memory token،
 * 401-retry hook). در SSR context این‌ها یا خطا می‌دهند یا silent fail می‌کنند.
 * native fetch() که Next.js آن را extend کرده، مسیر صحیح برای Server Component است.
 */
import 'server-only';

import { cookies } from 'next/headers';

import { readNestApiBaseUrl } from '@/lib/nest-proxy';

const LANG_HEADER = { 'x-custom-lang': 'fa' } as const;

function buildNestUrl(path: string): string {
  const base = readNestApiBaseUrl();
  if (!base) {
    throw new Error(
      'Nest API URL not configured. Set BACKEND_INTERNAL_URL or NEST_API_URL.'
    );
  }
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

async function buildHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  return {
    ...LANG_HEADER,
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };
}

/** شکل صفحه‌بندی استاندارد پاسخ‌های Nest. */
type NestPagedResponse<T> = {
  data: T[];
  hasNextPage: boolean;
};

/**
 * همه صفحات یک endpoint صفحه‌بندی‌شده Nest را به‌صورت server-side می‌خواند.
 * برای endpoint هایی که نیاز به auth دارند، کوکی‌های request کاربر فوروارد می‌شود.
 * cache: 'no-store' چون داده CMS توسط ادمین در هر لحظه تغییر می‌کند.
 */
export async function nestServerGetAllPages<TItem>(
  path: string
): Promise<TItem[]> {
  const headers = await buildHeaders();
  const all: TItem[] = [];
  let page = 1;

  while (true) {
    const params = new URLSearchParams({ page: String(page), limit: '100' });
    const url = `${buildNestUrl(path)}?${params}`;

    const res = await fetch(url, { cache: 'no-store', headers });

    if (!res.ok) {
      throw new Error(`GET ${path} (page ${page}) → HTTP ${res.status}`);
    }

    const body = (await res.json()) as NestPagedResponse<TItem>;
    all.push(...body.data);
    if (!body.hasNextPage) break;
    page++;
  }

  return all;
}
