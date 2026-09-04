import dns from 'node:dns';
import { Agent, fetch as undiciFetch } from 'undici';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // بعضی runtimeها این API را ندارند.
}

/**
 * Darkube روی اتصال دوم `UND_ERR_CONNECT_TIMEOUT` می‌دهد.
 * پیش‌فرض undici برای socket همان `connectTimeout` است (۱۰ثانیه)، نه `connect.timeout`.
 */
const nestDispatcher = new Agent({
  connectTimeout: 30_000,
  connections: 8,
  pipelining: 0,
  keepAliveTimeout: 30_000,
  keepAliveMaxTimeout: 60_000,
  headersTimeout: 60_000,
  bodyTimeout: 60_000,
});

/**
 * Fetch سرور-به-سرور به Nest (و upstreamهای HTTPS مشابه).
 * Vitest همان `global fetch` تا stub تست‌ها بماند.
 *
 * undici و DOM `RequestInit`/`Response` تایپ‌های جدا دارند؛
 * runtime سازگار است — cast از طریق `unknown`/`never` عمدی است.
 */
export async function fetchNestUpstream(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const { cache: _cache, ...rest } = init;
  const nextInit = {
    ...rest,
    redirect: init.redirect ?? ('manual' as const),
    signal: init.signal ?? AbortSignal.timeout(60_000),
  };

  if (process.env.VITEST === 'true') {
    return fetch(url, { ...nextInit, cache: 'no-store' });
  }

  return undiciFetch(url, {
    ...nextInit,
    dispatcher: nestDispatcher,
  } as never) as unknown as Promise<Response>;
}

export function logNestUpstreamFailure(context: string, error: unknown): void {
  const cause =
    error instanceof Error && 'cause' in error ? error.cause : undefined;
  console.error(`[${context}] Nest fetch failed:`, cause ?? error);
}
