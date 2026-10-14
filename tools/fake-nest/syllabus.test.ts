// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { startFake, type FakeHarness } from './test-helpers';

type Semester = {
  id: string;
  season: string;
  structure: string;
  academicYear: string;
  courseSelection: boolean;
  startClasses: boolean;
};

type BundleLesson = {
  id: string;
  title: string;
  status: boolean;
  originalLessonId?: string;
  weeks: Array<{ id: string; priority: number; status: boolean }>;
};

type Bundle = {
  id: string;
  academicYears: string;
  lessons: BundleLesson[];
  courseSelection?: boolean;
};

let h: FakeHarness;
let token = '';

beforeAll(async () => {
  h = await startFake();
});

afterAll(async () => {
  await h.close();
});

beforeEach(async () => {
  await h.reset();
  token = await h.adminToken();
});

async function semesters(): Promise<Semester[]> {
  return (await h.call('GET', '/api/admin/semester', { token })).json as Semester[];
}

async function bundles(structure?: string): Promise<Bundle[]> {
  const query = structure ? `?structure=${structure}` : '';
  return (await h.call('GET', `/api/admin/semesters_all${query}`, { token })).json as Bundle[];
}

async function createSemester(body: Record<string, unknown>) {
  return h.call('POST', '/api/admin/semester', { token, body });
}

describe('احراز هویت', () => {
  it('همهٔ endpointهای ترم و درس توکن ادمین می‌خواهند', async () => {
    expect((await h.call('GET', '/api/admin/semester')).status).toBe(401);
    expect((await h.call('GET', '/api/v1/original-lessons')).status).toBe(401);
    expect((await h.call('GET', '/api/admin/settings')).status).toBe(401);
  });
});

describe('ترم', () => {
  it('seed دو ترم (ترمی و پودمانی) با گیت‌های بسته دارد', async () => {
    const rows = await semesters();
    expect(rows.map((row) => row.structure).sort()).toEqual(['podmani', 'semester']);
    expect(rows.every((row) => !row.courseSelection && !row.startClasses)).toBe(true);
  });

  it('semesters_all فیلتر structure را اعمال می‌کند و academicYears جمع می‌دهد، بدون گیت', async () => {
    const termly = await bundles('semester');
    expect(termly).toHaveLength(1);
    expect(termly[0]!.academicYears).toBe('۱۴۰۵-۱۴۰۶');
    expect(termly[0]!.courseSelection).toBeUndefined();
    expect(termly[0]!.lessons.map((lesson) => lesson.title)).toEqual([
      'کارورزی ۱',
      'کارورزی ۲',
      'کارورزی ۳',
      'کارورزی ۴',
    ]);
    expect((await bundles('podmani'))[0]!.lessons).toHaveLength(2);
    expect(await bundles()).toHaveLength(2);
  });

  it('ساخت ترم، درس‌های ثابت می‌سازد (رفتار فعلی بک‌اند)', async () => {
    const created = await createSemester({
      season: 'two',
      structure: 'semester',
      academicYear: '۱۴۰۶-۱۴۰۷',
    });
    expect(created.status).toBe(201);
    const id = (created.json as Semester).id;
    const mine = (await bundles('semester')).find((row) => row.id === id)!;
    expect(mine.lessons).toHaveLength(4);
    expect(mine.lessons.every((lesson) => lesson.originalLessonId === undefined)).toBe(true);
    expect(mine.lessons.every((lesson) => lesson.weeks.length === 0)).toBe(true);
  });

  it('بدنهٔ ناقص یا enum اشتباه ۴۲۲ است', async () => {
    const missing = await createSemester({ season: 'one', structure: 'semester' });
    expect(missing.status).toBe(422);
    const badSeason = await createSemester({
      season: 'three',
      structure: 'semester',
      academicYear: '۱۴۰۶-۱۴۰۷',
    });
    expect(badSeason.status).toBe(422);
  });

  it('PATCH جزئی گیت را عوض می‌کند و ترم ناموجود ۴۰۴ است', async () => {
    const [first] = await semesters();
    const patched = await h.call('PATCH', `/api/admin/semester/${first!.id}`, {
      token,
      body: { courseSelection: true },
    });
    expect(patched.status).toBe(200);
    expect(patched.json).toMatchObject({ id: first!.id, courseSelection: true, season: first!.season });
    expect(
      (await h.call('PATCH', '/api/admin/semester/nope', { token, body: { startClasses: true } })).status
    ).toBe(404);
  });

  it('ترم تکراری و دو ترم هم‌نوعِ هم‌فصل با انتخاب واحد باز، ۴۰۰ می‌دهد (Swagger)', async () => {
    const [termly] = (await semesters()).filter((row) => row.structure === 'semester');
    const other = (
      await createSemester({ season: 'one', structure: 'semester', academicYear: '۱۴۰۶-۱۴۰۷' })
    ).json as Semester;

    const duplicate = await h.call('PATCH', `/api/admin/semester/${other.id}`, {
      token,
      body: { academicYear: termly!.academicYear },
    });
    expect(duplicate.status).toBe(400);

    await h.call('PATCH', `/api/admin/semester/${termly!.id}`, { token, body: { courseSelection: true } });
    const conflict = await h.call('PATCH', `/api/admin/semester/${other.id}`, {
      token,
      body: { courseSelection: true },
    });
    expect(conflict.status).toBe(400);
  });

  it('حذف ترم، درس‌ها و هفته‌ها و ظرفیت‌های آن را هم پاک می‌کند', async () => {
    const [bundle] = await bundles('semester');
    const lesson = bundle!.lessons[0]!;
    await h.call('PUT', `/api/admin/lessons/${lesson.id}/weeks`, {
      token,
      body: { weeks: [{ priority: 1, status: true }] },
    });
    await h.call('POST', '/api/admin/professor-capacities', {
      token,
      body: [{ professorId: 'p1', lessonId: lesson.id, semesterId: bundle!.id, capacity: 5, days: [0] }],
    });

    expect((await h.call('DELETE', `/api/admin/semester/${bundle!.id}`, { token })).status).toBe(200);

    const store = h.fake.store();
    expect(store.lessons.size).toBe(2);
    expect(store.weeks.size).toBe(0);
    expect(store.professorCapacities.size).toBe(0);
    expect((await h.call('GET', `/api/admin/semester/${bundle!.id}`, { token })).status).toBe(404);
  });
});

describe('درس‌های ترم', () => {
  it('وضعیت تکی و گروهی ۲۰۴ می‌دهد و فقط status را عوض می‌کند', async () => {
    const [bundle] = await bundles('semester');
    const [a, b] = bundle!.lessons;
    expect(
      (await h.call('PATCH', `/api/admin/lessons/${a!.id}/status`, { token, body: { status: true } })).status
    ).toBe(204);
    expect(
      (
        await h.call('PATCH', '/api/admin/lessons/status', {
          token,
          body: [{ id: b!.id, status: true }, { id: a!.id, status: false }],
        })
      ).status
    ).toBe(204);
    const after = (await bundles('semester'))[0]!.lessons;
    expect(after.find((lesson) => lesson.id === a!.id)!.status).toBe(false);
    expect(after.find((lesson) => lesson.id === b!.id)!.status).toBe(true);
  });

  it('تغییر گروهی همه‌یا‌هیچ است: یک شناسهٔ ناموجود هیچ‌چیز را عوض نمی‌کند', async () => {
    const [bundle] = await bundles('semester');
    const target = bundle!.lessons[0]!;
    const result = await h.call('PATCH', '/api/admin/lessons/status', {
      token,
      body: [{ id: target.id, status: true }, { id: 'missing', status: true }],
    });
    expect(result.status).toBe(404);
    const after = (await bundles('semester'))[0]!.lessons.find((lesson) => lesson.id === target.id)!;
    expect(after.status).toBe(false);
  });
});

describe('هفته‌ها', () => {
  async function firstLessonId(): Promise<string> {
    return (await bundles('semester'))[0]!.lessons[0]!.id;
  }

  it('PUT همهٔ هفته‌ها را جایگزین می‌کند و GET به ترتیب می‌دهد', async () => {
    const lessonId = await firstLessonId();
    const put = await h.call('PUT', `/api/admin/lessons/${lessonId}/weeks`, {
      token,
      body: { weeks: [{ priority: 3, status: true }, { priority: 1, status: false }] },
    });
    expect(put.status).toBe(204);
    const list = (await h.call('GET', `/api/admin/weeks/lesson/${lessonId}`, { token })).json as Array<{
      priority: number;
      lessonId: string;
    }>;
    expect(list.map((week) => week.priority)).toEqual([3, 1]);
    expect(list.every((week) => week.lessonId === lessonId)).toBe(true);

    await h.call('PUT', `/api/admin/lessons/${lessonId}/weeks`, {
      token,
      body: { weeks: [{ priority: 2, status: true }] },
    });
    const replaced = (await h.call('GET', `/api/admin/weeks/lesson/${lessonId}`, { token })).json as unknown[];
    expect(replaced).toHaveLength(1);
  });

  it('POST و PATCH هفته ۲۰۴ می‌دهند و ضریب خارج از ۱ تا ۵ ۴۲۲ است', async () => {
    const lessonId = await firstLessonId();
    expect(
      (await h.call('POST', '/api/admin/weeks', { token, body: { lessonId, priority: 2, status: false } })).status
    ).toBe(204);
    const [week] = (await h.call('GET', `/api/admin/weeks/lesson/${lessonId}`, { token })).json as Array<{ id: string }>;
    expect(
      (await h.call('PATCH', `/api/admin/weeks/${week!.id}`, { token, body: { status: true, priority: 5 } })).status
    ).toBe(204);
    const [after] = (await h.call('GET', `/api/admin/weeks/lesson/${lessonId}`, { token })).json as Array<{
      status: boolean;
      priority: number;
    }>;
    expect(after).toMatchObject({ status: true, priority: 5 });

    const invalid = await h.call('POST', '/api/admin/weeks', {
      token,
      body: { lessonId, priority: 6, status: false },
    });
    expect(invalid.status).toBe(422);
  });

  it('هفتهٔ درس ناموجود ۴۰۴ است', async () => {
    expect((await h.call('GET', '/api/admin/weeks/lesson/none', { token })).status).toBe(404);
    expect(
      (await h.call('PUT', '/api/admin/lessons/none/weeks', { token, body: { weeks: [] } })).status
    ).toBe(404);
  });
});

describe('تنظیمات عمومی', () => {
  it('GET آخرین ردیف را می‌دهد و هر POST ردیف تازه می‌افزاید', async () => {
    expect((await h.call('GET', '/api/admin/settings', { token })).json).toMatchObject({
      generalProfessorCapacity: 30,
      systemPassingScore: 60,
    });
    const created = await h.call('POST', '/api/admin/settings', {
      token,
      body: { generalProfessorCapacity: 12, systemPassingScore: 70 },
    });
    expect(created.status).toBe(201);
    expect((await h.call('GET', '/api/admin/settings', { token })).json).toMatchObject({
      generalProfessorCapacity: 12,
      systemPassingScore: 70,
    });
    expect(h.fake.store().settings).toHaveLength(2);
  });
});

describe('ظرفیت استاد', () => {
  async function ids() {
    const [bundle] = await bundles('semester');
    return { semesterId: bundle!.id, lessonId: bundle!.lessons[0]!.id };
  }

  it('ثبت، فیلتر و ویرایش ظرفیت', async () => {
    const { semesterId, lessonId } = await ids();
    const item = { professorId: 'prof-1', lessonId, semesterId, capacity: 10, days: [0, 2] };
    expect((await h.call('POST', '/api/admin/professor-capacities', { token, body: [item] })).status).toBe(204);

    const listed = (
      await h.call('GET', `/api/admin/professor-capacities?semesterId=${semesterId}&lessonId=${lessonId}`, { token })
    ).json as Array<{ id: string; capacity: number }>;
    expect(listed).toHaveLength(1);
    expect(
      (await h.call('GET', '/api/admin/professor-capacities?lessonId=other', { token })).json
    ).toEqual([]);

    expect(
      (await h.call('PUT', '/api/admin/professor-capacities', { token, body: [{ ...item, capacity: 20 }] })).status
    ).toBe(204);
    const updated = (await h.call('GET', `/api/admin/professor-capacities?semesterId=${semesterId}`, { token }))
      .json as Array<{ capacity: number }>;
    expect(updated[0]!.capacity).toBe(20);
  });

  it('ظرفیت بیش از سقف عمومی یا روزهای تکراری ۴۲۲ است', async () => {
    const { semesterId, lessonId } = await ids();
    const base = { professorId: 'prof-1', lessonId, semesterId, capacity: 10, days: [0] };
    const over = await h.call('POST', '/api/admin/professor-capacities', {
      token,
      body: [{ ...base, capacity: 31 }],
    });
    expect(over.status).toBe(422);
    expect(over.json).toMatchObject({ errors: { capacity: expect.any(String) } });
    const dup = await h.call('POST', '/api/admin/professor-capacities', {
      token,
      body: [{ ...base, days: [1, 1] }],
    });
    expect(dup.status).toBe(422);
  });

  it('PUT برای ظرفیت ثبت‌نشده ۴۰۴ است', async () => {
    const { semesterId, lessonId } = await ids();
    const result = await h.call('PUT', '/api/admin/professor-capacities', {
      token,
      body: [{ professorId: 'nobody', lessonId, semesterId, capacity: 5, days: [0] }],
    });
    expect(result.status).toBe(404);
  });
});

describe('تعریف دروس (original-lessons)', () => {
  it('ساخت گروهی ردیف‌های تخت می‌سازد و آرایه برمی‌گرداند', async () => {
    const created = await h.call('POST', '/api/v1/original-lessons', {
      token,
      body: {
        type: 'semester',
        data: [{ mainTitle: 'پروژه', lessons: [{ lessonTitle: 'پروژه الف' }, { lessonTitle: 'پروژه ب' }] }],
      },
    });
    expect(created.status).toBe(201);
    expect(created.json).toHaveLength(2);
    expect(created.json).toEqual([
      expect.objectContaining({ mainTitle: 'پروژه', lessonTitle: 'پروژه الف', status: 'active', type: 'semester' }),
      expect.objectContaining({ lessonTitle: 'پروژه ب' }),
    ]);
  });

  it('نوع نامعتبر ۴۲۲ است', async () => {
    const result = await h.call('POST', '/api/v1/original-lessons', {
      token,
      body: { type: 'modular', data: [] },
    });
    expect(result.status).toBe(422);
  });

  it('لیست با فیلتر mainTitle و status و صفحه‌بندی', async () => {
    await h.call('POST', '/api/v1/original-lessons', {
      token,
      body: {
        type: 'podmani',
        data: [{ mainTitle: 'کارگاه', lessons: [{ lessonTitle: 'الف' }, { lessonTitle: 'ب' }, { lessonTitle: 'ج' }] }],
      },
    });
    const all = (await h.call('GET', '/api/v1/original-lessons?limit=100', { token })).json as {
      data: Array<{ id: string; mainTitle: string }>;
      hasNextPage: boolean;
    };
    expect(all.data).toHaveLength(4);

    const page = (await h.call('GET', '/api/v1/original-lessons?page=1&limit=3', { token })).json as {
      data: unknown[];
      hasNextPage: boolean;
    };
    expect(page.data).toHaveLength(3);
    expect(page.hasNextPage).toBe(true);

    const workshop = (await h.call('GET', '/api/v1/original-lessons?mainTitle=کارگاه', { token })).json as {
      data: unknown[];
    };
    expect(workshop.data).toHaveLength(3);

    const target = all.data.find((row) => row.mainTitle === 'کارگاه')!;
    await h.call('PATCH', `/api/v1/original-lessons/${target.id}`, { token, body: { status: 'deactive' } });
    const inactive = (await h.call('GET', '/api/v1/original-lessons?status=deactive', { token })).json as {
      data: unknown[];
    };
    expect(inactive.data).toHaveLength(1);
  });

  it('PATCH، GET تکی و DELETE', async () => {
    const [seeded] = ((await h.call('GET', '/api/v1/original-lessons', { token })).json as {
      data: Array<{ id: string }>;
    }).data;
    const patched = await h.call('PATCH', `/api/v1/original-lessons/${seeded!.id}`, {
      token,
      body: { lessonTitle: 'بیسی ۲' },
    });
    expect(patched.json).toMatchObject({ lessonTitle: 'بیسی ۲', mainTitle: 'بیسی' });
    expect((await h.call('GET', `/api/v1/original-lessons/${seeded!.id}`, { token })).status).toBe(200);
    expect((await h.call('DELETE', `/api/v1/original-lessons/${seeded!.id}`, { token })).status).toBe(200);
    expect((await h.call('GET', `/api/v1/original-lessons/${seeded!.id}`, { token })).status).toBe(404);
  });
});

describe('حالت original: درس‌های ترم از «تعریف دروس» فعال (تغییر درخواستی از بک‌اند)', () => {
  let original: FakeHarness;
  let originalToken = '';

  beforeAll(async () => {
    original = await startFake({ termLessons: 'original' });
  });

  afterAll(async () => {
    await original.close();
  });

  beforeEach(async () => {
    await original.reset();
    originalToken = await original.adminToken();
  });

  it('درس ترم جدید فقط از درس‌های فعال همان نوع ساخته می‌شود و originalLessonId دارد', async () => {
    await original.call('POST', '/api/v1/original-lessons', {
      token: originalToken,
      body: { type: 'semester', data: [{ mainTitle: 'پروژه', lessons: [{ lessonTitle: 'پروژه الف' }] }] },
    });
    await original.call('POST', '/api/v1/original-lessons', {
      token: originalToken,
      body: { type: 'podmani', data: [{ mainTitle: 'مهارت', lessons: [{ lessonTitle: 'مهارت ۱' }] }] },
    });
    const list = (await original.call('GET', '/api/v1/original-lessons', { token: originalToken })).json as {
      data: Array<{ id: string; lessonTitle: string }>;
    };
    const archived = list.data.find((row) => row.lessonTitle === 'پروژه الف')!;
    await original.call('POST', '/api/v1/original-lessons', {
      token: originalToken,
      body: { type: 'semester', data: [{ mainTitle: 'قدیمی', lessons: [{ lessonTitle: 'قدیمی' }] }] },
    });
    const old = ((await original.call('GET', '/api/v1/original-lessons?mainTitle=قدیمی', { token: originalToken }))
      .json as { data: Array<{ id: string }> }).data[0]!;
    await original.call('PATCH', `/api/v1/original-lessons/${old.id}`, {
      token: originalToken,
      body: { status: 'deactive' },
    });

    const created = await original.call('POST', '/api/admin/semester', {
      token: originalToken,
      body: { season: 'two', structure: 'semester', academicYear: '۱۴۰۶-۱۴۰۷' },
    });
    const id = (created.json as { id: string }).id;
    const rows = (await original.call('GET', '/api/admin/semesters_all?structure=semester', { token: originalToken }))
      .json as Bundle[];
    const lessons = rows.find((row) => row.id === id)!.lessons;

    expect(lessons.map((lesson) => lesson.title).sort()).toEqual(['بیسی', 'پروژه الف'].sort());
    expect(lessons.find((lesson) => lesson.title === 'پروژه الف')!.originalLessonId).toBe(archived.id);
  });
});
