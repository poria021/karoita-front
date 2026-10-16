/** ابزار مشترک تست‌های سرور جعلی: راه‌اندازی روی پورت آزاد و فراخوانی HTTP. */
import { expect } from 'vitest';

import { createFakeNest, type FakeNest, type FakeNestOptions } from './server';
import { SEED_ADMIN_PHONE, SEED_PASSWORD } from './seed';

export type CallResult = { status: number; json: unknown; text: string };

export type CallOptions = {
  body?: unknown;
  token?: string;
  raw?: Buffer;
  contentType?: string;
};

export type FakeHarness = {
  fake: FakeNest;
  base: string;
  call: (method: string, path: string, options?: CallOptions) => Promise<CallResult>;
  adminToken: () => Promise<string>;
  reset: () => Promise<void>;
  close: () => Promise<void>;
};

export async function startFake(options: FakeNestOptions = {}): Promise<FakeHarness> {
  const fake = createFakeNest({ port: 0, quiet: true, ...options });
  const base = `http://localhost:${await fake.listen()}`;

  const call: FakeHarness['call'] = async (method, path, callOptions = {}) => {
    const headers: Record<string, string> = {};
    if (callOptions.token) headers.authorization = `Bearer ${callOptions.token}`;
    let payload: BodyInit | undefined;
    if (callOptions.raw) {
      headers['content-type'] = callOptions.contentType ?? 'application/octet-stream';
      payload = new Uint8Array(callOptions.raw);
    } else if (callOptions.body !== undefined) {
      headers['content-type'] = 'application/json';
      payload = JSON.stringify(callOptions.body);
    }
    const response = await fetch(`${base}${path}`, { method, headers, body: payload });
    const text = await response.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    return { status: response.status, json, text };
  };

  return {
    fake,
    base,
    call,
    reset: async () => {
      await call('POST', '/__fake/reset');
    },
    adminToken: async () => {
      const result = await call('POST', '/api/v1/admin/auth/phone/login/password', {
        body: { phone: SEED_ADMIN_PHONE, password: SEED_PASSWORD },
      });
      expect(result.status).toBe(200);
      return (result.json as { token: string }).token;
    },
    close: () => fake.close(),
  };
}
