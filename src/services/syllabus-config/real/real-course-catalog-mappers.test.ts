import { describe, expect, it } from 'vitest';

import type { NestOriginalLesson } from '@/types/nest-original-lessons';

import {
  groupOriginalLessons,
  planCourseUpdate,
  toNestBulkCreateBody,
} from './real-course-catalog-mappers';

function row(overrides: Partial<NestOriginalLesson>): NestOriginalLesson {
  return {
    id: 'id',
    status: 'active',
    type: 'semester',
    mainTitle: 'ریاضی',
    lessonTitle: 'جبر',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('groupOriginalLessons', () => {
  it('ردیف‌های هم‌عنوان را به یک درس با زیرمجموعه تبدیل می‌کند', () => {
    const [course] = groupOriginalLessons([
      row({ id: 'a', lessonTitle: 'جبر' }),
      row({ id: 'b', lessonTitle: 'هندسه' }),
    ]);
    expect(course).toMatchObject({
      id: 'semester::ریاضی',
      title: 'ریاضی',
      audience: 'semester',
      isActive: true,
      subModules: [
        { id: 'a', title: 'جبر' },
        { id: 'b', title: 'هندسه' },
      ],
    });
  });

  it('podmani را modular می‌کند و نوع‌ها را جدا گروه می‌کند', () => {
    const courses = groupOriginalLessons([
      row({ id: 'a' }),
      row({ id: 'b', type: 'podmani' }),
    ]);
    expect(courses.map((c) => c.audience)).toEqual(['semester', 'modular']);
  });

  it('ردیف با lessonTitle برابر mainTitle درس بدون زیرمجموعه است', () => {
    const [course] = groupOriginalLessons([
      row({ mainTitle: 'پروژه', lessonTitle: 'پروژه' }),
    ]);
    expect(course!.subModules).toEqual([]);
  });

  it('سطح زیرمجموعه‌ها را از عنوان یا ترتیب داینامیک می‌گیرد تا سایدبار درس‌ها رندر شود', () => {
    const [course] = groupOriginalLessons([
      row({ id: 'a', mainTitle: 'کارورزی', lessonTitle: 'کارورزی ۲' }),
      row({ id: 'b', mainTitle: 'کارورزی', lessonTitle: 'کارورزی ۳' }),
    ]);

    expect(course).toMatchObject({
      audience: 'semester',
      subModules: [
        { id: 'a', title: 'کارورزی ۲', level: 2 },
        { id: 'b', title: 'کارورزی ۳', level: 3 },
      ],
    });
  });

  it('هنگام نبود عدد در عنوان، سطح داینامیک به ترتیب ۱۰۱، ۱۰۲، ... می‌گیرد', () => {
    const [course] = groupOriginalLessons([
      row({ id: 'a', mainTitle: 'کارگاه', lessonTitle: 'جلسه اول' }),
      row({ id: 'b', mainTitle: 'کارگاه', lessonTitle: 'جلسه دوم' }),
    ]);

    expect(course?.subModules.map((sub) => sub.level)).toEqual([101, 102]);
  });

  it('سطح داینامیک بین چند درس یکتا است تا چند آیتم سایدبار path یکسان نگیرند', () => {
    const courses = groupOriginalLessons([
      row({ id: 'a', mainTitle: 'سیتسب', lessonTitle: 'سیتسب' }),
      row({ id: 'b', mainTitle: 'کارگاه', lessonTitle: 'کارگاه' }),
      row({
        id: 'c',
        mainTitle: 'ظظظظ',
        lessonTitle: 'ظظظظ الف',
      }),
      row({
        id: 'd',
        mainTitle: 'ظظظظ',
        lessonTitle: 'ظظظظ ب',
      }),
    ]);

    const levels = courses.flatMap((course) =>
      course.subModules.length > 0
        ? course.subModules.map((sub) => sub.level)
        : [course.level]
    );

    expect(levels).toEqual([101, 102, 103, 104]);
    expect(new Set(levels).size).toBe(levels.length);
  });

  it('درس فقط وقتی بایگانی است که همهٔ ردیف‌ها deactive باشند', () => {
    const [mixed] = groupOriginalLessons([
      row({ id: 'a', status: 'deactive' }),
      row({ id: 'b', status: 'active', lessonTitle: 'هندسه' }),
    ]);
    const [archived] = groupOriginalLessons([
      row({ id: 'a', status: 'deactive' }),
      row({ id: 'b', status: 'deactive', lessonTitle: 'هندسه' }),
    ]);
    expect(mixed!.isActive).toBe(true);
    expect(archived!.isActive).toBe(false);
  });
});

describe('toNestBulkCreateBody', () => {
  it('زیرمجموعه‌ها را به lessons نگاشت می‌کند', () => {
    expect(
      toNestBulkCreateBody({
        title: ' ریاضی ',
        audience: 'modular',
        isActive: true,
        subModules: [{ title: ' جبر ' }, { title: 'هندسه' }],
      })
    ).toEqual({
      type: 'podmani',
      data: [
        { mainTitle: 'ریاضی', lessons: [{ lessonTitle: 'جبر' }, { lessonTitle: 'هندسه' }] },
      ],
    });
  });

  it('درس بدون زیرمجموعه را با lessonTitle برابر عنوان می‌فرستد', () => {
    expect(
      toNestBulkCreateBody({
        title: 'پروژه',
        audience: 'semester',
        isActive: true,
        subModules: [],
      }).data[0]
    ).toEqual({ mainTitle: 'پروژه', lessons: [{ lessonTitle: 'پروژه' }] });
  });
});

describe('planCourseUpdate', () => {
  const base = {
    title: 'ریاضی',
    audience: 'semester' as const,
    isActive: true,
  };
  const rows = [
    row({ id: 'a', lessonTitle: 'جبر' }),
    row({ id: 'b', lessonTitle: 'هندسه' }),
  ];

  it('بدون تغییر هیچ کاری نمی‌کند', () => {
    const plan = planCourseUpdate(rows, {
      ...base,
      subModules: [
        { id: 'a', title: 'جبر' },
        { id: 'b', title: 'هندسه' },
      ],
    });
    expect(plan).toEqual({ patches: [], create: null, deactivateCreated: false, deleteIds: [] });
  });

  it('تغییر عنوان درس همهٔ ردیف‌ها را PATCH می‌کند', () => {
    const plan = planCourseUpdate(rows, {
      ...base,
      title: 'ریاضی ۲',
      subModules: [
        { id: 'a', title: 'جبر' },
        { id: 'b', title: 'هندسه' },
      ],
    });
    expect(plan.patches).toEqual([
      { id: 'a', body: { mainTitle: 'ریاضی ۲' } },
      { id: 'b', body: { mainTitle: 'ریاضی ۲' } },
    ]);
  });

  it('زیرمجموعهٔ تازه POST و زیرمجموعهٔ حذف‌شده DELETE می‌شود', () => {
    const plan = planCourseUpdate(rows, {
      ...base,
      subModules: [{ id: 'a', title: 'جبر' }, { title: 'آمار' }],
    });
    expect(plan.create).toEqual({
      type: 'semester',
      data: [{ mainTitle: 'ریاضی', lessons: [{ lessonTitle: 'آمار' }] }],
    });
    expect(plan.deleteIds).toEqual(['b']);
  });

  it('بایگانی status همهٔ ردیف‌ها را deactive می‌کند', () => {
    const plan = planCourseUpdate(rows, {
      ...base,
      isActive: false,
      subModules: [
        { id: 'a', title: 'جبر' },
        { id: 'b', title: 'هندسه' },
      ],
    });
    expect(plan.patches.map((p) => p.body)).toEqual([
      { status: 'deactive' },
      { status: 'deactive' },
    ]);
  });

  it('ردیف تازهٔ درس بایگانی بعد از ساخت deactive می‌شود', () => {
    const plan = planCourseUpdate(rows, {
      ...base,
      isActive: false,
      subModules: [{ id: 'a', title: 'جبر' }, { title: 'آمار' }],
    });
    expect(plan.deactivateCreated).toBe(true);
  });

  it('درس بدون زیرمجموعه روی ردیف اول می‌نشیند', () => {
    const plan = planCourseUpdate([row({ id: 'a', mainTitle: 'پروژه', lessonTitle: 'پروژه' })], {
      ...base,
      title: 'پروژه نهایی',
      subModules: [],
    });
    expect(plan.patches).toEqual([
      { id: 'a', body: { mainTitle: 'پروژه نهایی', lessonTitle: 'پروژه نهایی' } },
    ]);
    expect(plan.create).toBeNull();
    expect(plan.deleteIds).toEqual([]);
  });
});
