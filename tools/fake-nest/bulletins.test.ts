// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { PROPOSED_PATHS } from './openapi';
import { SEED_MENTOR_PHONE, SEED_PASSWORD } from './seed';
import { startFake, type FakeHarness } from './test-helpers';

type Bulletin = {
  id: string;
  kind: 'announcement' | 'advertisement';
  title: string;
  isActive: boolean;
  authorRole: string;
  audienceRoles: string[];
  provinces: string[];
};

let h: FakeHarness;
let admin: string;
let mentor: string;
let student: string;

async function userToken(phone: string): Promise<string> {
  const result = await h.call('POST', '/api/v1/auth/phone/login/password', {
    body: { phone, password: SEED_PASSWORD },
  });
  expect(result.status).toBe(200);
  return (result.json as { token: string }).token;
}

const ad = (patch: Record<string, unknown> = {}) => ({
  kind: 'advertisement',
  title: 'تبلیغ تست',
  body: 'توضیح',
  audienceRoles: ['student'],
  provinces: ['تهران'],
  ...patch,
});

beforeAll(async () => {
  h = await startFake();
});

afterAll(async () => {
  await h.close();
});

beforeEach(async () => {
  await h.reset();
  admin = await h.adminToken();
  mentor = await userToken(`0${SEED_MENTOR_PHONE}`);
  student = await userToken('09123456781');
});

describe('bulletins (قرارداد پیشنهادی)', () => {
  it('مسیرها از فایل پیشنهادی می‌آیند نه snapshot', () => {
    expect(PROPOSED_PATHS).toContain('/api/v1/bulletins');
  });

  it('بدون توکن ۴۰۱ می‌دهد', async () => {
    expect((await h.call('GET', '/api/v1/bulletins')).status).toBe(401);
  });

  it('ادمین می‌سازد؛ غیرفعال از میز کار مخاطب پنهان و در مدیریت می‌ماند', async () => {
    const created = await h.call('POST', '/api/v1/bulletins', { token: admin, body: ad() });
    expect(created.status).toBe(201);
    const { id } = created.json as Bulletin;

    const seen = (await h.call('GET', '/api/v1/bulletins', { token: student })).json as Bulletin[];
    expect(seen.some((row) => row.id === id)).toBe(true);

    const off = await h.call('PATCH', `/api/v1/bulletins/${id}/active`, {
      token: admin,
      body: { isActive: false },
    });
    expect((off.json as Bulletin).isActive).toBe(false);

    const after = (await h.call('GET', '/api/v1/bulletins', { token: student })).json as Bulletin[];
    expect(after.some((row) => row.id === id)).toBe(false);
    const managed = (await h.call('GET', '/api/v1/bulletins/managed', { token: admin }))
      .json as Bulletin[];
    expect(managed.some((row) => row.id === id && !row.isActive)).toBe(true);
  });

  it('تبلیغ فقط از ستاد؛ استاد راهنما فقط به دانشجو اطلاعیه می‌دهد', async () => {
    expect((await h.call('POST', '/api/v1/bulletins', { token: mentor, body: ad() })).status).toBe(
      403
    );
    const outside = await h.call('POST', '/api/v1/bulletins', {
      token: mentor,
      body: ad({ kind: 'announcement', audienceRoles: ['teacher'] }),
    });
    expect(outside.status).toBe(422);
    const okRow = await h.call('POST', '/api/v1/bulletins', {
      token: mentor,
      body: ad({ kind: 'announcement', audienceRoles: ['student'] }),
    });
    expect(okRow.status).toBe(201);
  });

  it('استان الزامی است و پنل دیگر نمی‌تواند ویرایش/حذف کند', async () => {
    const noProvince = await h.call('POST', '/api/v1/bulletins', {
      token: admin,
      body: ad({ provinces: [] }),
    });
    expect(noProvince.status).toBe(422);

    const { id } = (await h.call('POST', '/api/v1/bulletins', { token: admin, body: ad() }))
      .json as Bulletin;
    expect((await h.call('DELETE', `/api/v1/bulletins/${id}`, { token: mentor })).status).toBe(404);
    expect((await h.call('DELETE', `/api/v1/bulletins/${id}`, { token: admin })).status).toBe(204);
  });

  it('فهرست استان‌ها برای انتخابگر مخاطب', async () => {
    const result = await h.call('GET', '/api/admin/province/all', { token: admin });
    expect(result.status).toBe(200);
    expect((result.json as Array<{ title: string }>).map((row) => row.title)).toContain('تهران');
  });
});
