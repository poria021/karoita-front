// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { PROPOSED_PATHS } from './openapi';
import { SEED_ASSISTANT_PHONE, SEED_MENTOR_PHONE, SEED_PASSWORD } from './seed';
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
let assistant: string;
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
  const assistantLogin = await h.call('POST', '/api/v1/admin/auth/phone/login/password', {
    body: { phone: SEED_ASSISTANT_PHONE, password: SEED_PASSWORD },
  });
  expect(assistantLogin.status).toBe(200);
  assistant = (assistantLogin.json as { token: string }).token;
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

  it('پنل‌های غیرستادی بدون استان منتشر می‌کنند؛ فقط ستاد استان را الزامی دارد', async () => {
    const mentorRow = await h.call('POST', '/api/v1/bulletins', {
      token: mentor,
      body: ad({ kind: 'announcement', audienceRoles: ['student'], provinces: [] }),
    });
    expect(mentorRow.status).toBe(201);
    expect((mentorRow.json as Bulletin).provinces).toEqual([]);

    // حتی اگر استان بفرستد ذخیره نمی‌شود.
    const withProvince = await h.call('POST', '/api/v1/bulletins', {
      token: mentor,
      body: ad({ kind: 'announcement', audienceRoles: ['student'], provinces: ['قم'] }),
    });
    expect((withProvince.json as Bulletin).provinces).toEqual([]);
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

  it('دستیار مدیر ارشد با مدیر ارشد یک ستاد مشترک است', async () => {
    const seeded = (await h.call('GET', '/api/v1/bulletins/managed', { token: admin }))
      .json as Bulletin[];
    const seededAd = seeded.find((row) => row.kind === 'advertisement')!;

    // دستیار موارد مدیر ارشد را می‌بیند، ویرایش، غیرفعال و حذف می‌کند؛ نویسندهٔ اصلی عوض نمی‌شود.
    const managed = (await h.call('GET', '/api/v1/bulletins/managed', { token: assistant }))
      .json as Bulletin[];
    expect(managed.map((row) => row.id)).toContain(seededAd.id);

    const edited = await h.call('PATCH', `/api/v1/bulletins/${seededAd.id}`, {
      token: assistant,
      body: ad({ title: 'ویرایش توسط دستیار' }),
    });
    expect(edited.status).toBe(200);
    expect((edited.json as Bulletin).authorRole).toBe('superadmin');

    // دستیار هم تبلیغ منتشر می‌کند و مدیر ارشد آن را در مدیریت می‌بیند.
    const created = await h.call('POST', '/api/v1/bulletins', { token: assistant, body: ad() });
    expect(created.status).toBe(201);
    expect((created.json as Bulletin).authorRole).toBe('admin');
    const { id } = created.json as Bulletin;
    const seenByAdmin = (await h.call('GET', '/api/v1/bulletins/managed', { token: admin }))
      .json as Bulletin[];
    expect(seenByAdmin.map((row) => row.id)).toContain(id);

    expect(
      (await h.call('DELETE', `/api/v1/bulletins/${id}`, { token: assistant })).status
    ).toBe(204);
  });

  it('فهرست استان‌ها برای انتخابگر مخاطب', async () => {
    const result = await h.call('GET', '/api/admin/province/all', { token: admin });
    expect(result.status).toBe(200);
    expect((result.json as Array<{ title: string }>).map((row) => row.title)).toContain('تهران');
  });
});
