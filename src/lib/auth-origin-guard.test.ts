import { describe, expect, it } from 'vitest';

import { assertSameOriginPost } from './auth-origin-guard';

const makeRequest = (
  url: string,
  headers: Record<string, string | null>,
): Parameters<typeof assertSameOriginPost>[0] => ({
  url,
  headers: { get: (name: string) => headers[name] ?? null },
});

describe('assertSameOriginPost', () => {
  const appUrl = 'https://app.karvita.test/api/auth/set-tokens';

  it('اجازه می‌دهد وقتی Sec-Fetch-Site همان same-origin است', () => {
    const result = assertSameOriginPost(
      makeRequest(appUrl, { 'sec-fetch-site': 'same-origin' }),
    );
    expect(result.ok).toBe(true);
  });

  it('اجازه می‌دهد وقتی Sec-Fetch-Site برابر none است (همان صفحه)', () => {
    const result = assertSameOriginPost(
      makeRequest(appUrl, { 'sec-fetch-site': 'none' }),
    );
    expect(result.ok).toBe(true);
  });

  it('رد می‌کند وقتی Sec-Fetch-Site برابر cross-site است', () => {
    const result = assertSameOriginPost(
      makeRequest(appUrl, { 'sec-fetch-site': 'cross-site' }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(403);
  });

  it('رد می‌کند وقتی Sec-Fetch-Site برابر same-site اما متقاطع است', () => {
    const result = assertSameOriginPost(
      makeRequest(appUrl, { 'sec-fetch-site': 'same-site' }),
    );
    expect(result.ok).toBe(false);
  });

  it('fallback به Origin: اجازه وقتی مبدأ همخوان است', () => {
    const result = assertSameOriginPost(
      makeRequest(appUrl, { origin: 'https://app.karvita.test' }),
    );
    expect(result.ok).toBe(true);
  });

  it('fallback به Origin: رد وقتی مبدأ متفاوت است', () => {
    const result = assertSameOriginPost(
      makeRequest(appUrl, { origin: 'https://evil.test' }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(403);
  });

  it('محتاطانه رد می‌کند وقتی هیچ هدری موجود نیست', () => {
    const result = assertSameOriginPost(makeRequest(appUrl, {}));
    expect(result.ok).toBe(false);
  });
});
