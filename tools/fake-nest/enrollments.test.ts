// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { SEED_MENTOR_PHONE, SEED_PASSWORD } from './seed';
import { startFake, type FakeHarness } from './test-helpers';

type Enrollment = {
  id: string;
  studentId: string;
  status: string;
  schoolId: string | null;
  teacherId: string | null;
  lessonId: string;
  semesterId: string;
};

type Week = {
  id: string;
  status: string;
  score: number | null;
  weightedScore: number | null;
  weekId: { id: string; priority: number };
  studentStatus: string | null;
  mentorStatus: string | null;
  teacherStatus: string | null;
  schoolAdminStatus: string | null;
  schoolVisited: boolean;
  isMentorPresent: boolean;
  isApprovedBySchoolAdminMentorPresent: boolean;
  isApprovedBySchoolAdminStudentPresent: boolean;
  studentPresentAt: string | null;
  canWatchOthers: boolean;
};

type Conversation = {
  id: string;
  type: string;
  weekId: string | null;
  unreadCount: number;
  participantIds: string[];
};

const PHONES = {
  mentor: SEED_MENTOR_PHONE,
  student1: '09123456781',
  student2: '09123456782',
  student3: '09123456783',
  teacher: '09123456791',
  principal: '09123456792',
} as const;

let h: FakeHarness;
const tokens: Partial<Record<keyof typeof PHONES, string>> = {};

async function login(who: keyof typeof PHONES): Promise<string> {
  const result = await h.call('POST', '/api/v1/auth/phone/login/password', {
    body: { phone: PHONES[who], password: SEED_PASSWORD },
  });
  expect(result.status, `login ${who}`).toBe(200);
  return (result.json as { token: string }).token;
}

beforeAll(async () => {
  h = await startFake();
});

afterAll(async () => {
  await h.close();
});

beforeEach(async () => {
  await h.reset();
  for (const who of Object.keys(PHONES) as Array<keyof typeof PHONES>) {
    tokens[who] = await login(who);
  }
});

const t = (who: keyof typeof PHONES): string => tokens[who]!;

async function mentorStudents(who: keyof typeof PHONES): Promise<Enrollment[]> {
  const result = await h.call('GET', '/api/v1/student-enrollments/mentor/students?limit=100', {
    token: t(who),
  });
  return (result.json as { data: Enrollment[] }).data;
}

/** ثبت‌نام دانشجوی n‌ام (seed: به ترتیب نگار، علی، پارسا). */
async function enrollmentOf(index: 0 | 1 | 2): Promise<Enrollment> {
  const rows = await mentorStudents('mentor');
  const phone = ['student1', 'student2', 'student3'][index] as keyof typeof PHONES;
  const me = (await h.call('GET', '/api/v1/auth/me', { token: t(phone) })).json as { id: string };
  return rows.find((row) => row.studentId === me.id)!;
}

async function weeksOf(who: keyof typeof PHONES, enrollmentId: string): Promise<Week[]> {
  const result = await h.call('GET', `/api/v1/student-enrollments/${enrollmentId}/weeks`, {
    token: t(who),
  });
  expect(result.status).toBe(200);
  return result.json as Week[];
}

async function conversationsOf(
  who: keyof typeof PHONES,
  enrollmentId: string
): Promise<Conversation[]> {
  const result = await h.call('GET', `/api/v1/conversations?enrollmentId=${enrollmentId}`, {
    token: t(who),
  });
  expect(result.status).toBe(200);
  return result.json as Conversation[];
}

describe('فهرست‌ها بر اساس نقش', () => {
  it('استاد هر سه ثبت‌نام خودش را با خلاصه‌ی دانشجو می‌بیند', async () => {
    const rows = await mentorStudents('mentor');
    expect(rows).toHaveLength(3);
    const result = await h.call('GET', '/api/v1/student-enrollments/mentor/students', {
      token: t('mentor'),
    });
    const first = (result.json as { data: Array<{ student: Record<string, unknown> }> }).data[0]!;
    expect(first.student).toMatchObject({ firstName: 'نگار', lastName: 'محمدی', roleName: 'student' });
  });

  it('معلم فقط ثبت‌نام‌های خودش و مدیر مدرسه فقط ثبت‌نام‌های مدرسه‌اش را می‌بیند', async () => {
    expect(await mentorStudents('teacher')).toHaveLength(2);
    expect(await mentorStudents('principal')).toHaveLength(2);
  });

  it('دانشجو و ادمین به فهرست استاد دسترسی ندارند', async () => {
    const asStudent = await h.call('GET', '/api/v1/student-enrollments/mentor/students', {
      token: t('student1'),
    });
    expect(asStudent.status).toBe(403);
    const asAdmin = await h.call('GET', '/api/v1/student-enrollments/mentor/students', {
      token: await h.adminToken(),
    });
    expect(asAdmin.status).toBe(403);
  });

  it('فیلتر lessonId و semesterId اعمال می‌شود', async () => {
    const [one] = await mentorStudents('mentor');
    const other = await h.call(
      'GET',
      `/api/v1/student-enrollments/mentor/students?lessonId=none&semesterId=${one!.semesterId}`,
      { token: t('mentor') }
    );
    expect((other.json as { data: unknown[] }).data).toHaveLength(0);
  });

  it('ظرفیت استاد: کل، انتخاب‌شده و باقی‌مانده', async () => {
    const [one] = await mentorStudents('mentor');
    const result = await h.call(
      'GET',
      `/api/v1/student-enrollments/mentor/capacity?semesterId=${one!.semesterId}`,
      { token: t('mentor') }
    );
    expect(result.json).toEqual({
      semesterId: one!.semesterId,
      allTeacherCapacity: 10,
      selected: 3,
      remain: 7,
    });
    const missing = await h.call('GET', '/api/v1/student-enrollments/mentor/capacity', {
      token: t('mentor'),
    });
    expect(missing.status).toBe(422);
    const asStudent = await h.call(
      'GET',
      `/api/v1/student-enrollments/mentor/capacity?semesterId=${one!.semesterId}`,
      { token: t('student1') }
    );
    expect(asStudent.status).toBe(403);
  });
});

describe('هفته‌ها و وضعیت کارت‌ها', () => {
  it('هر وضعیت seed با فیلدهایی که فرانت می‌خواند برمی‌گردد', async () => {
    const first = await weeksOf('mentor', (await enrollmentOf(0)).id);
    expect(first).toHaveLength(4);
    expect(first[0]).toMatchObject({
      status: 'completed',
      score: 90,
      weightedScore: 270,
      mentorStatus: 'score',
      schoolVisited: true,
      isMentorPresent: true,
    });
    expect(first[0]!.weekId.priority).toBe(3);
    expect(first[1]).toMatchObject({ status: 'submitted', studentStatus: 'send', mentorStatus: null });
    expect(first[2]).toMatchObject({ status: 'pending', studentStatus: null });

    const second = await weeksOf('mentor', (await enrollmentOf(1)).id);
    expect(second[0]).toMatchObject({ status: 'in_progress', mentorStatus: 'send' });

    const third = await weeksOf('mentor', (await enrollmentOf(2)).id);
    expect(third.every((week) => week.status === 'pending')).toBe(true);
  });

  it('دانشجوی دیگر هفته‌های این ثبت‌نام را نمی‌بیند', async () => {
    const enrollment = await enrollmentOf(0);
    const result = await h.call('GET', `/api/v1/student-enrollments/${enrollment.id}/weeks`, {
      token: t('student2'),
    });
    expect(result.status).toBe(403);
  });

  it('خلاصه‌ی نمره (تقریبی): جمع، تعداد، سقف و نمره‌ی وزنی از ۲۰', async () => {
    const enrollment = await enrollmentOf(0);
    const result = await h.call('GET', `/api/v1/student-enrollments/${enrollment.id}/score-summary`, {
      token: t('mentor'),
    });
    expect(result.json).toEqual({
      totalScore: 90,
      scoredWeeks: 1,
      totalWeeks: 4,
      maximumScore: 400,
      weightedScore: 4.5,
    });
  });
});

describe('نمره و حضور', () => {
  it('استاد نمره می‌دهد، هفته بسته و نمره‌ی وزنی حساب می‌شود', async () => {
    const enrollment = await enrollmentOf(2);
    const [week] = await weeksOf('mentor', enrollment.id);
    const result = await h.call('PATCH', `/api/v1/student-weeks/${week!.id}/score`, {
      token: t('mentor'),
      body: { score: 80, schoolVisited: true },
    });
    expect(result.status).toBe(200);
    const [after] = await weeksOf('mentor', enrollment.id);
    expect(after).toMatchObject({
      status: 'completed',
      score: 80,
      weightedScore: 240,
      mentorStatus: 'score',
      schoolVisited: true,
    });
  });

  it('نمره‌ی خارج از ۰ تا ۱۰۰ ۴۲۲ و نقش غیر استاد ۴۰۳ است', async () => {
    const enrollment = await enrollmentOf(2);
    const [week] = await weeksOf('mentor', enrollment.id);
    const url = `/api/v1/student-weeks/${week!.id}/score`;
    expect((await h.call('PATCH', url, { token: t('mentor'), body: { score: 101 } })).status).toBe(422);
    expect((await h.call('PATCH', url, { token: t('teacher'), body: { score: 50 } })).status).toBe(403);
    expect((await h.call('PATCH', url, { token: t('student3'), body: { score: 50 } })).status).toBe(403);
  });

  it('اعلام حضور و اجازه‌ی دیدن فقط با استاد راهنما', async () => {
    const enrollment = await enrollmentOf(0);
    const [, , week] = await weeksOf('mentor', enrollment.id);
    const present = `/api/v1/student-weeks/${week!.id}/mentor-present`;
    const watch = `/api/v1/student-weeks/${week!.id}/can-watch-others`;
    expect((await h.call('PATCH', present, { token: t('mentor'), body: { isMentorPresent: true } })).status).toBe(200);
    expect((await h.call('PATCH', watch, { token: t('mentor'), body: { canWatchOthers: true } })).status).toBe(200);
    expect((await h.call('PATCH', present, { token: t('student1'), body: { isMentorPresent: true } })).status).toBe(403);
    expect((await h.call('PATCH', watch, { token: t('teacher'), body: { canWatchOthers: true } })).status).toBe(403);
    const after = (await weeksOf('mentor', enrollment.id))[2]!;
    expect(after).toMatchObject({ isMentorPresent: true, canWatchOthers: true });
  });

  it('تأیید حضور فقط با مدیر همان مدرسه و زمان پیش‌فرض اکنون است', async () => {
    const enrollment = await enrollmentOf(0);
    const [, , week] = await weeksOf('mentor', enrollment.id);
    const url = `/api/v1/student-weeks/${week!.id}/approve-student-present`;
    expect(
      (await h.call('PATCH', url, { token: t('teacher'), body: { isApprovedBySchoolAdminStudentPresent: true } })).status
    ).toBe(403);
    expect(
      (await h.call('PATCH', url, { token: t('mentor'), body: { isApprovedBySchoolAdminStudentPresent: true } })).status
    ).toBe(403);
    expect(
      (await h.call('PATCH', url, { token: t('principal'), body: { isApprovedBySchoolAdminStudentPresent: true } })).status
    ).toBe(200);
    const approved = (await weeksOf('mentor', enrollment.id))[2]!;
    expect(approved.isApprovedBySchoolAdminStudentPresent).toBe(true);
    expect(approved.studentPresentAt).toEqual(expect.any(String));

    await h.call('PATCH', url, { token: t('principal'), body: { isApprovedBySchoolAdminStudentPresent: false } });
    const revoked = (await weeksOf('mentor', enrollment.id))[2]!;
    expect(revoked.studentPresentAt).toBeNull();
  });

  it('ثبت‌نام بدون مدرسه (دانشجوی ۳) را مدیر مدرسه تأیید نمی‌کند', async () => {
    const enrollment = await enrollmentOf(2);
    const [week] = await weeksOf('mentor', enrollment.id);
    const result = await h.call('PATCH', `/api/v1/student-weeks/${week!.id}/approve-mentor-present`, {
      token: t('principal'),
      body: { isApprovedBySchoolAdminMentorPresent: true },
    });
    expect(result.status).toBe(403);
  });
});

describe('گفتگوها', () => {
  it('هر ثبت‌نام یک گفتگوی general و یک گفتگوی week برای هر هفته دارد', async () => {
    const enrollment = await enrollmentOf(0);
    const conversations = await conversationsOf('mentor', enrollment.id);
    expect(conversations.map((row) => row.type).sort()).toEqual(['general', 'week', 'week', 'week', 'week']);
    expect(conversations.filter((row) => row.weekId).every((row) => row.participantIds.length === 4)).toBe(true);
  });

  it('خوانده‌نشده‌ها و علامت خوانده‌شدن', async () => {
    const enrollment = await enrollmentOf(0);
    const weeks = await weeksOf('mentor', enrollment.id);
    const secondWeekConversation = (await conversationsOf('mentor', enrollment.id)).find(
      (row) => row.weekId === weeks[1]!.weekId.id
    )!;
    expect(secondWeekConversation.unreadCount).toBe(1);
    expect(
      (await h.call('PATCH', `/api/v1/conversations/${secondWeekConversation.id}/read`, { token: t('mentor') })).status
    ).toBe(200);
    const after = (await conversationsOf('mentor', enrollment.id)).find(
      (row) => row.id === secondWeekConversation.id
    )!;
    expect(after.unreadCount).toBe(0);
  });

  it('پیام‌ها با نقش فرستنده و صفحه‌بندی cursor برمی‌گردند', async () => {
    const enrollment = await enrollmentOf(1);
    const weeks = await weeksOf('mentor', enrollment.id);
    const conversation = (await conversationsOf('mentor', enrollment.id)).find(
      (row) => row.weekId === weeks[0]!.weekId.id
    )!;
    const all = (
      await h.call('GET', `/api/v1/conversations/${conversation.id}/messages`, { token: t('mentor') })
    ).json as { data: Array<{ senderId: { role: string }; sequence: number }>; hasNextPage: boolean };
    expect(all.data.map((message) => message.senderId.role)).toEqual(['student', 'mentor']);
    expect(all.hasNextPage).toBe(false);

    const latest = (
      await h.call('GET', `/api/v1/conversations/${conversation.id}/messages?limit=1`, { token: t('mentor') })
    ).json as { data: Array<{ sequence: number }>; hasNextPage: boolean };
    expect(latest.data.map((message) => message.sequence)).toEqual([2]);
    expect(latest.hasNextPage).toBe(true);

    const older = (
      await h.call('GET', `/api/v1/conversations/${conversation.id}/messages?beforeSequence=2`, {
        token: t('mentor'),
      })
    ).json as { data: Array<{ sequence: number }> };
    expect(older.data.map((message) => message.sequence)).toEqual([1]);
  });

  it('جریان وضعیت: ارسال دانشجو → رد استاد → ارسال دوباره → بازخورد معلم و مدیر', async () => {
    // ثبت‌نامی که مدرسه و معلم دارد، تا همه‌ی نقش‌ها مشارکت‌کننده باشند.
    const enrollment = await enrollmentOf(0);
    const week = (await weeksOf('mentor', enrollment.id))[2]!;
    const conversation = (await conversationsOf('mentor', enrollment.id)).find(
      (row) => row.weekId === week.weekId.id
    )!;
    const post = (who: keyof typeof PHONES, body: Record<string, unknown>) =>
      h.call('POST', `/api/v1/conversations/${conversation.id}/messages`, { token: t(who), body });
    const state = async () => (await weeksOf('mentor', enrollment.id))[2]!;

    expect((await post('student1', { text: 'گزارش من' })).status).toBe(201);
    expect(await state()).toMatchObject({ status: 'submitted', studentStatus: 'send', mentorStatus: null });

    expect((await post('mentor', { text: 'اصلاح کنید' })).status).toBe(201);
    expect(await state()).toMatchObject({ status: 'in_progress', mentorStatus: 'send' });

    await post('student1', { text: 'نسخه‌ی اصلاح‌شده' });
    expect(await state()).toMatchObject({ status: 'submitted', studentStatus: 'send', mentorStatus: null });

    expect((await post('teacher', { text: 'خوب بود', rating: 4 })).status).toBe(201);
    expect((await post('principal', { rating: 5 })).status).toBe(201);
    expect(await state()).toMatchObject({ teacherStatus: 'send', schoolAdminStatus: 'send' });
  });

  it('اعتبارسنجی پیام: خالی، امتیاز نامعتبر، امتیاز از نقش غیرمجاز و فایل تأییدنشده', async () => {
    const enrollment = await enrollmentOf(0);
    const [conversation] = await conversationsOf('mentor', enrollment.id);
    const url = `/api/v1/conversations/${conversation!.id}/messages`;
    expect((await h.call('POST', url, { token: t('student1'), body: {} })).status).toBe(422);
    expect((await h.call('POST', url, { token: t('teacher'), body: { rating: 6 } })).status).toBe(422);
    expect((await h.call('POST', url, { token: t('mentor'), body: { rating: 3 } })).status).toBe(403);
    expect(
      (await h.call('POST', url, { token: t('student1'), body: { text: 'x', fileIds: ['missing'] } })).status
    ).toBe(422);
  });

  it('غیرمشارک به گفتگو دسترسی ندارد و هفته‌ی نمره‌گرفته با پیام عوض نمی‌شود', async () => {
    const enrollment = await enrollmentOf(0);
    const weeks = await weeksOf('mentor', enrollment.id);
    const conversation = (await conversationsOf('mentor', enrollment.id)).find(
      (row) => row.weekId === weeks[0]!.weekId.id
    )!;
    const url = `/api/v1/conversations/${conversation.id}/messages`;
    expect((await h.call('GET', url, { token: t('student2') })).status).toBe(403);
    expect((await h.call('POST', url, { token: t('student1'), body: { text: 'بعد از نمره' } })).status).toBe(201);
    expect((await weeksOf('mentor', enrollment.id))[0]).toMatchObject({
      status: 'completed',
      mentorStatus: 'score',
    });
  });
});

describe('انتخاب واحد', () => {
  it('ترم باز: درس انتخاب‌شده in_progress است و درس‌های بسته blockReason ندارند', async () => {
    const result = await h.call('GET', '/api/v1/student-enrollments/open-course-selection', {
      token: t('student1'),
    });
    expect(result.status).toBe(200);
    const body = result.json as {
      courseSelection: boolean;
      lessons: Array<{ canSelect: boolean; blockReason?: string; status: boolean }>;
    };
    expect(body.courseSelection).toBe(true);
    expect(body.lessons[0]).toMatchObject({ canSelect: false, blockReason: 'in_progress' });
    expect(body.lessons[1]).toMatchObject({ status: false, canSelect: false });
    expect('blockReason' in body.lessons[1]!).toBe(false);

    expect(
      (await h.call('GET', '/api/v1/student-enrollments/open-course-selection', { token: t('mentor') })).status
    ).toBe(403);
  });

  it('ترم باز نباشد ۴۰۴ است', async () => {
    const admin = await h.adminToken();
    const [row] = (await h.call('GET', '/api/admin/semester', { token: admin })).json as Array<{
      id: string;
      structure: string;
    }>;
    await h.call('PATCH', `/api/admin/semester/${row!.id}`, { token: admin, body: { courseSelection: false } });
    expect(
      (await h.call('GET', '/api/v1/student-enrollments/open-course-selection', { token: t('student1') })).status
    ).toBe(404);
  });

  it('فهرست استادها فقط ظرفیت‌دارها و باقی‌مانده را نشان می‌دهد؛ پارامتر الزامی', async () => {
    const enrollment = await enrollmentOf(2);
    const url = `/api/v1/student-enrollments/professors?semesterId=${enrollment.semesterId}&lessonId=${enrollment.lessonId}`;
    const result = await h.call('GET', url, { token: t('student3') });
    expect(result.json).toMatchObject({
      data: [{ firstName: 'امیرحسین', capacity: 7, days: [0, 2], university: [] }],
      hasNextPage: false,
    });
    expect(
      (await h.call('GET', '/api/v1/student-enrollments/professors', { token: t('student3') })).status
    ).toBe(422);
  });

  it('فهرست معلم‌ها بر اساس مدرسه', async () => {
    const enrollment = await enrollmentOf(0);
    const mine = await h.call('GET', `/api/v1/student-enrollments/teachers?schoolId=${enrollment.schoolId}`, {
      token: t('student1'),
    });
    expect(mine.json).toEqual([expect.objectContaining({ firstName: 'سارا', lastName: 'موسوی' })]);
    const other = await h.call('GET', '/api/v1/student-enrollments/teachers?schoolId=none', {
      token: t('student1'),
    });
    expect(other.json).toEqual([]);
  });

  it('لغو، آزاد شدن ظرفیت و ثبت‌نام دوباره با همه‌ی گفتگوها و هفته‌ها', async () => {
    const enrollment = await enrollmentOf(2);
    expect(
      (await h.call('PATCH', `/api/v1/student-enrollments/${enrollment.id}/cancel`, { token: t('student3') })).status
    ).toBe(200);
    expect(
      (await h.call('PATCH', `/api/v1/student-enrollments/${enrollment.id}/cancel`, { token: t('student3') })).status
    ).toBe(400);

    const open = (
      await h.call('GET', '/api/v1/student-enrollments/open-course-selection', { token: t('student3') })
    ).json as { lessons: Array<{ canSelect: boolean }> };
    expect(open.lessons[0]!.canSelect).toBe(true);

    const mentor = (await h.call('GET', '/api/v1/auth/me', { token: t('mentor') })).json as { id: string };
    const created = await h.call('POST', '/api/v1/student-enrollments', {
      token: t('student3'),
      body: { semesterId: enrollment.semesterId, lessonId: enrollment.lessonId, professorId: mentor.id },
    });
    expect(created.status).toBe(204);

    const mine = (await h.call('GET', '/api/v1/student-enrollments', { token: t('student3') })).json as Array<{
      id: string;
      status: string;
    }>;
    const fresh = mine.find((row) => row.status === 'active')!;
    expect(fresh.id).not.toBe(enrollment.id);
    expect(await weeksOf('student3', fresh.id)).toHaveLength(4);
    expect(await conversationsOf('student3', fresh.id)).toHaveLength(5);
  });

  it('انتخاب تکراری، ترم بسته و درس بسته ۴۰۰ می‌دهند', async () => {
    const enrollment = await enrollmentOf(0);
    const mentor = (await h.call('GET', '/api/v1/auth/me', { token: t('mentor') })).json as { id: string };
    const create = (lessonId: string) =>
      h.call('POST', '/api/v1/student-enrollments', {
        token: t('student1'),
        body: { semesterId: enrollment.semesterId, lessonId, professorId: mentor.id },
      });
    expect((await create(enrollment.lessonId)).status).toBe(400);

    const lessons = (
      await h.call('GET', '/api/v1/student-enrollments/open-course-selection', { token: t('student1') })
    ).json as { lessons: Array<{ id: string; status: boolean }> };
    const closedLesson = lessons.lessons.find((lesson) => !lesson.status)!;
    expect((await create(closedLesson.id)).status).toBe(400);
  });

  it('ظرفیت پر ۴۰۰ می‌دهد', async () => {
    const admin = await h.adminToken();
    const enrollment = await enrollmentOf(2);
    const mentor = (await h.call('GET', '/api/v1/auth/me', { token: t('mentor') })).json as { id: string };
    await h.call('PATCH', `/api/v1/student-enrollments/${enrollment.id}/cancel`, { token: t('student3') });
    await h.call('PUT', '/api/admin/professor-capacities', {
      token: admin,
      body: [
        {
          professorId: mentor.id,
          lessonId: enrollment.lessonId,
          semesterId: enrollment.semesterId,
          capacity: 2,
          days: [0],
        },
      ],
    });
    const result = await h.call('POST', '/api/v1/student-enrollments', {
      token: t('student3'),
      body: { semesterId: enrollment.semesterId, lessonId: enrollment.lessonId, professorId: mentor.id },
    });
    expect(result.status).toBe(400);
  });

  it('تعیین مدرسه و معلم بعد از ثبت‌نام فقط با خود دانشجو و معلم همان مدرسه', async () => {
    const enrollment = await enrollmentOf(2);
    const school = (await enrollmentOf(0)).schoolId!;
    const teacher = (
      await h.call('GET', `/api/v1/student-enrollments/teachers?schoolId=${school}`, { token: t('student3') })
    ).json as Array<{ id: string }>;
    const url = `/api/v1/student-enrollments/${enrollment.id}`;

    expect(
      (await h.call('PATCH', url, { token: t('student2'), body: { schoolId: school } })).status
    ).toBe(403);
    expect(
      (await h.call('PATCH', url, { token: t('student3'), body: { teacherId: teacher[0]!.id } })).status
    ).toBe(200);
    const assigned = await h.call('PATCH', url, { token: t('student3'), body: { schoolId: school } });
    expect(assigned.json).toMatchObject({ schoolId: school, teacherId: teacher[0]!.id });
    expect(
      (await h.call('PATCH', url, { token: t('student3'), body: { schoolId: 'unknown' } })).status
    ).toBe(404);
  });

  it('by-semester سابقه‌ی ثبت‌نام را با خلاصه‌ی مدرسه، معلم و استاد می‌دهد', async () => {
    const result = await h.call('GET', '/api/v1/student-enrollments/by-semester', { token: t('student1') });
    const lessons = (result.json as Array<{ lessons: Array<{ enrolment: Record<string, unknown> | null }> }>)
      .flatMap((semester) => semester.lessons)
      .filter((lesson) => lesson.enrolment);
    expect(lessons).toHaveLength(1);
    expect(lessons[0]!.enrolment).toMatchObject({
      status: 'active',
      school: { title: 'هنرستان فنی شهید بهشتی' },
      teacher: { firstName: 'سارا' },
      professor: { firstName: 'امیرحسین' },
    });
  });

  it('لغو با استاد ممکن است و پیام در ثبت‌نام لغوشده ۴۰۰ می‌شود', async () => {
    const enrollment = await enrollmentOf(1);
    const [conversation] = await conversationsOf('mentor', enrollment.id);
    expect(
      (await h.call('PATCH', `/api/v1/student-enrollments/${enrollment.id}/cancel`, { token: t('mentor') })).status
    ).toBe(200);
    const post = await h.call('POST', `/api/v1/conversations/${conversation!.id}/messages`, {
      token: t('student2'),
      body: { text: 'سلام' },
    });
    expect(post.status).toBe(400);
    expect(
      (await h.call('PATCH', `/api/v1/student-enrollments/${enrollment.id}/cancel`, { token: t('student1') })).status
    ).toBe(403);
  });
});

describe('فایل‌های درس', () => {
  async function confirmedFile(token: string): Promise<string> {
    const created = await h.call('POST', '/api/v1/files/upload', {
      token,
      body: { fileName: 'jozve.pdf', fileSize: 3, mimeType: 'application/pdf' },
    });
    const { file, uploadSignedUrl } = created.json as { file: { id: string }; uploadSignedUrl: string };
    await fetch(uploadSignedUrl, { method: 'PUT', body: new Uint8Array([1, 2, 3]) });
    await h.call('PATCH', `/api/v1/files/${file.id}/confirm`, { token, body: {} });
    return file.id;
  }

  it('استاد فایل‌های خودش را می‌بیند و دانشجوی همان درس فایل استاد خودش را', async () => {
    const enrollment = await enrollmentOf(0);
    const mine = await h.call('GET', '/api/v1/mentor-lesson-files', { token: t('mentor') });
    expect(mine.json).toHaveLength(1);
    expect(mine.json).toEqual([
      expect.objectContaining({ lessonId: enrollment.lessonId, description: 'خلاصه‌ی مباحث جلسه اول' }),
    ]);

    const asStudent = await h.call('GET', `/api/v1/lessons/${enrollment.lessonId}/mentor-files`, {
      token: t('student1'),
    });
    expect(asStudent.json).toHaveLength(1);
    expect((asStudent.json as Array<{ files: Array<{ path: string }> }>)[0]!.files[0]!.path).toContain('/storage/');

    expect((await h.call('GET', '/api/v1/mentor-lesson-files', { token: t('student1') })).status).toBe(403);
    expect(
      (await h.call('GET', `/api/v1/lessons/${enrollment.lessonId}/mentor-files`, { token: t('mentor') })).status
    ).toBe(403);
  });

  it('بعد از لغو ثبت‌نام فایل‌های استاد دیگر دیده نمی‌شود', async () => {
    const enrollment = await enrollmentOf(2);
    await h.call('PATCH', `/api/v1/student-enrollments/${enrollment.id}/cancel`, { token: t('student3') });
    const result = await h.call('GET', `/api/v1/lessons/${enrollment.lessonId}/mentor-files`, {
      token: t('student3'),
    });
    expect(result.json).toEqual([]);
  });

  it('ثبت با فایل تأییدشده، رد فایل تأییدنشده و درس ناموجود، و حذف فقط با استاد', async () => {
    const enrollment = await enrollmentOf(0);
    const fileId = await confirmedFile(t('mentor'));
    const created = await h.call('POST', '/api/v1/mentor-lesson-files', {
      token: t('mentor'),
      body: { lessonId: enrollment.lessonId, fileIds: [fileId], description: '  فصل دوم ' },
    });
    expect(created.status).toBe(201);
    expect(created.json).toMatchObject({ description: 'فصل دوم', professorId: expect.any(String) });
    const id = (created.json as { id: string }).id;

    expect(
      (await h.call('POST', '/api/v1/mentor-lesson-files', {
        token: t('mentor'),
        body: { lessonId: enrollment.lessonId, fileIds: ['unconfirmed'] },
      })).status
    ).toBe(422);
    expect(
      (await h.call('POST', '/api/v1/mentor-lesson-files', {
        token: t('mentor'),
        body: { lessonId: 'none', fileIds: [fileId] },
      })).status
    ).toBe(404);
    expect(
      (await h.call('POST', '/api/v1/mentor-lesson-files', {
        token: t('student1'),
        body: { lessonId: enrollment.lessonId, fileIds: [fileId] },
      })).status
    ).toBe(403);

    expect((await h.call('DELETE', `/api/v1/mentor-lesson-files/${id}`, { token: t('student1') })).status).toBe(403);
    expect((await h.call('DELETE', `/api/v1/mentor-lesson-files/${id}`, { token: t('mentor') })).status).toBe(204);
    expect((await h.call('DELETE', `/api/v1/mentor-lesson-files/${id}`, { token: t('mentor') })).status).toBe(404);
  });
});
