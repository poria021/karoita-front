import { describe, expect, it } from 'vitest';

import type { NestSemester } from '@/types/nest-admin';

import {
  buildCurrentTermView,
  currentTermStatus,
  kindsForRole,
  pickCurrentSemester,
  semesterKind,
} from './current-terms';

function semester(partial: Partial<NestSemester>): NestSemester {
  return {
    id: 'sem',
    season: 'one',
    structure: 'semester',
    academicYears: '1405-1406',
    ...partial,
  };
}

describe('kindsForRole', () => {
  it('student → ترمی، مهارت‌آموز → پودمان، بقیه → هر دو', () => {
    expect(kindsForRole('student')).toEqual(['semester']);
    expect(kindsForRole('skill_learner')).toEqual(['podmani']);
    expect(kindsForRole('super_admin' as never)).toEqual(['semester', 'podmani']);
  });
});

describe('semesterKind', () => {
  it('podmani و modular قدیمی هر دو پودمانی‌اند', () => {
    expect(semesterKind({ structure: 'podmani' })).toBe('podmani');
    expect(semesterKind({ structure: 'modular' })).toBe('podmani');
    expect(semesterKind({ structure: 'semester' })).toBe('semester');
  });
});

describe('pickCurrentSemester', () => {
  it('کلاس‌های در جریان از انتخاب واحد باز جلوتر است', () => {
    const list = [
      semester({ id: 'a', courseSelection: true, startClasses: false }),
      semester({ id: 'b', courseSelection: false, startClasses: true }),
    ];
    expect(pickCurrentSemester(list, 'semester')?.id).toBe('b');
  });

  it('فقط نیم‌سال همان نوع را برمی‌گرداند', () => {
    const list = [
      semester({ id: 'term', courseSelection: true }),
      semester({ id: 'mod', structure: 'podmani', startClasses: true }),
    ];
    expect(pickCurrentSemester(list, 'semester')?.id).toBe('term');
    expect(pickCurrentSemester(list, 'podmani')?.id).toBe('mod');
  });

  it('وقتی گیت‌ها آمده ولی همه بسته‌اند → null', () => {
    const list = [
      semester({ id: 'a', courseSelection: false, startClasses: false }),
    ];
    expect(pickCurrentSemester(list, 'semester')).toBeNull();
  });

  it('وقتی API گیت نداده → آخرین ردیف همان نوع', () => {
    const list = [semester({ id: 'old' }), semester({ id: 'new' })];
    expect(pickCurrentSemester(list, 'semester')?.id).toBe('new');
  });
});

describe('buildCurrentTermView / currentTermStatus', () => {
  it('بدون نیم‌سال: عنوان null و وضعیت بسته', () => {
    const view = buildCurrentTermView('semester', null);
    expect(view.title).toBeNull();
    expect(currentTermStatus(view)).toBe('closed');
  });

  it('گیت‌ها را از خود نیم‌سال می‌خواند و تعداد درس را نگه می‌دارد', () => {
    const view = buildCurrentTermView(
      'semester',
      semester({ courseSelection: true, startClasses: false }),
      4
    );
    expect(view.title).toBeTruthy();
    expect(view.enrollOpen).toBe(true);
    expect(view.classesStarted).toBe(false);
    expect(view.lessonCount).toBe(4);
    expect(currentTermStatus(view)).toBe('selecting');
  });

  it('کلاس‌ها در جریان بر انتخاب واحد غلبه دارد', () => {
    const view = buildCurrentTermView(
      'podmani',
      semester({ structure: 'podmani', courseSelection: true, startClasses: true })
    );
    expect(currentTermStatus(view)).toBe('running');
  });

  it('بدون هیچ گیتی → unknown (نه بسته)', () => {
    const view = buildCurrentTermView('semester', semester({}));
    expect(currentTermStatus(view)).toBe('unknown');
  });
});

describe('pickCurrentSemester — آخرین نیم‌سال باز', () => {
  it('وقتی ترم قدیمی هم هنوز در جریان است ترم جدیدتر انتخاب می‌شود', () => {
    const list = [
      semester({ id: 'old', startClasses: true, courseSelection: false }),
      semester({ id: 'new', startClasses: true, courseSelection: false }),
    ];
    expect(pickCurrentSemester(list, 'semester')?.id).toBe('new');
  });

  it('بین چند ترم با انتخاب واحد باز، آخری انتخاب می‌شود', () => {
    const list = [
      semester({ id: 'old', startClasses: false, courseSelection: true }),
      semester({ id: 'new', startClasses: false, courseSelection: true }),
    ];
    expect(pickCurrentSemester(list, 'semester')?.id).toBe('new');
  });
});
