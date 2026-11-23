import { describe, expect, it } from 'vitest';

import type { NestSemester } from '@/types/nest-admin';

import { pickCapacityTermId } from './capacity-term';

function semester(
  id: string,
  patch: Partial<NestSemester> = {}
): NestSemester {
  return { id, season: 'one', structure: 'semester', ...patch };
}

const TERMS = [{ id: 't1' }, { id: 't2' }, { id: 't3' }];

describe('pickCapacityTermId', () => {
  it('ترمِ در حال برگزاری را بر ترم انتخاب واحد ترجیح می‌دهد', () => {
    const semesters = [
      semester('t1', { courseSelection: true, startClasses: false }),
      semester('t2', { courseSelection: false, startClasses: true }),
      semester('t3', { courseSelection: false, startClasses: false }),
    ];
    expect(
      pickCapacityTermId({ terms: TERMS, semesters, kind: 'semester', fallback: 'last' })
    ).toBe('t2');
  });

  it('وقتی ترم جاری نیست آخرین ترم فهرست را برمی‌گرداند (real)', () => {
    const semesters = [
      semester('t1', { courseSelection: false, startClasses: false }),
      semester('t2', { courseSelection: false, startClasses: false }),
    ];
    expect(
      pickCapacityTermId({ terms: TERMS, semesters, kind: 'semester', fallback: 'last' })
    ).toBe('t3');
  });

  it('بدون فهرست نیم‌سال به fallback برمی‌گردد (mock: اولی)', () => {
    expect(
      pickCapacityTermId({ terms: TERMS, semesters: undefined, kind: 'semester', fallback: 'first' })
    ).toBe('t1');
  });

  it('ترم جاریِ خارج از فهرست ظرفیت را نادیده می‌گیرد', () => {
    const semesters = [semester('x9', { startClasses: true })];
    expect(
      pickCapacityTermId({ terms: TERMS, semesters, kind: 'semester', fallback: 'last' })
    ).toBe('t3');
  });

  it('برای پودمانی فقط ترم‌های podmani را در نظر می‌گیرد', () => {
    const semesters = [
      semester('t1', { startClasses: true }),
      semester('t2', { structure: 'podmani', startClasses: true }),
    ];
    expect(
      pickCapacityTermId({
        terms: [{ id: 't1' }, { id: 't2' }],
        semesters,
        kind: 'podmani',
        fallback: 'last',
      })
    ).toBe('t2');
  });

  it('فهرست خالی یعنی رشتهٔ خالی', () => {
    expect(
      pickCapacityTermId({ terms: [], semesters: [], kind: 'semester', fallback: 'last' })
    ).toBe('');
  });
});
