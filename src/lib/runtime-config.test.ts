// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildRuntimeConfig,
  readRuntimeAllowMockInProd,
  readRuntimeApiMode,
} from '@/lib/runtime-config';

afterEach(() => {
  vi.unstubAllEnvs();
  delete (globalThis as { window?: unknown }).window;
});

describe('runtime-config (server)', () => {
  it('APP_API_MODE بر NEXT_PUBLIC_API_MODE می‌چربد', () => {
    vi.stubEnv('APP_API_MODE', 'Mock');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    expect(readRuntimeApiMode()).toBe('mock');
  });

  it('بدون APP_API_MODE به NEXT_PUBLIC_API_MODE برمی‌گردد', () => {
    vi.stubEnv('APP_API_MODE', '');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    expect(readRuntimeApiMode()).toBe('real');
  });

  it('پرچم allow فقط با true دقیق روشن است', () => {
    vi.stubEnv('APP_ALLOW_MOCK_IN_PROD', 'true');
    expect(readRuntimeAllowMockInProd()).toBe(true);
    vi.stubEnv('APP_ALLOW_MOCK_IN_PROD', 'yes');
    expect(readRuntimeAllowMockInProd()).toBe(false);
  });

  it('buildRuntimeConfig فقط فیلدهای غیرمحرمانه را برمی‌گرداند', () => {
    vi.stubEnv('APP_API_MODE', 'mock');
    vi.stubEnv('APP_ALLOW_MOCK_IN_PROD', 'true');
    expect(buildRuntimeConfig()).toEqual({
      apiMode: 'mock',
      allowMockInProd: true,
    });
  });
});

describe('runtime-config (browser)', () => {
  it('window.__KV_RUNTIME__ بر مقدار بیلد می‌چربد', () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    (globalThis as { window?: unknown }).window = {
      __KV_RUNTIME__: { apiMode: 'mock', allowMockInProd: true },
    };
    expect(readRuntimeApiMode()).toBe('mock');
    expect(readRuntimeAllowMockInProd()).toBe(true);
  });

  it('بدون اسکریپت runtime به مقدار بیلد برمی‌گردد', () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    (globalThis as { window?: unknown }).window = {};
    expect(readRuntimeApiMode()).toBe('real');
  });
});
