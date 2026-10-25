// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { SEED_ADMIN_PHONE, SEED_PASSWORD } from './seed';
import { startFake, type FakeHarness } from './test-helpers';

let harness: FakeHarness;
const call: FakeHarness['call'] = (method, path, options) =>
  harness.call(method, path, options);
const adminToken = () => harness.adminToken();

beforeAll(async () => {
  harness = await startFake();
});

afterAll(async () => {
  await harness.close();
});

beforeEach(async () => {
  await harness.reset();
});

describe('fake-nest advertisements', () => {
  it('lists sidebar ads and infos for the current user', async () => {
    const token = await adminToken();
    const ads = await call(
      'GET',
      '/api/v1/advertisements?type=ads&placement=sidebar',
      { token }
    );
    const infos = await call(
      'GET',
      '/api/v1/advertisements?type=info&placement=sidebar',
      { token }
    );
    expect(ads.status).toBe(200);
    expect(infos.status).toBe(200);
    expect(Array.isArray(ads.json)).toBe(true);
    expect(Array.isArray(infos.json)).toBe(true);
    expect((ads.json as unknown[]).length).toBeGreaterThan(0);
    expect((infos.json as unknown[]).length).toBeGreaterThan(0);
  });

  it('creates info, toggles activation, and records a click', async () => {
    const token = await adminToken();
    const created = await call('POST', '/api/admin/advertisements', {
      token,
      body: {
        title: 'اطلاعیه تست',
        type: 'info',
        format: 'text',
        body: 'متن کوتاه تست',
        placement: 'sidebar',
        targetRoles: ['student'],
        targetProvinceIds: [],
      },
    });
    expect(created.status).toBe(201);
    const id = (created.json as { id: string }).id;

    const toggled = await call(
      'PATCH',
      `/api/admin/advertisements/${id}/activation`,
      { token, body: { isActive: false } }
    );
    expect(toggled.status).toBe(200);
    expect((toggled.json as { isActive: boolean }).isActive).toBe(false);

    const click = await call('POST', `/api/v1/advertisements/${id}/clicks`, {
      token,
    });
    expect(click.status).toBe(200);
    expect((click.json as { success: boolean }).success).toBe(true);
  });

  it('admin password login still works for seed phone', async () => {
    const login = await call('POST', '/api/v1/admin/auth/phone/login/password', {
      body: { phone: SEED_ADMIN_PHONE, password: SEED_PASSWORD },
    });
    expect(login.status).toBe(200);
    expect((login.json as { token: string }).token).toBeTruthy();
  });
});
