import type { NestSemester } from '@/types/nest-admin';

import { pickCurrentSemester, type CurrentTermKind } from './current-terms';

type CapacityTermRef = { id: string };

/**
 * ترمِ مبنای ظرفیت در میز کار استاد راهنما:
 * - ترم جاری (کلاس‌ها شروع شده > انتخاب واحد باز) با همان قاعدهٔ باکس خوش‌آمد.
 * - اگر ترم جاری پیدا نشد (یا در فهرست ظرفیت نبود): آخرین ترم فهرست.
 *   در حالت real آخرین عنصر فهرست جدیدترین ترم است (مثل `pickCurrentSemester`)،
 *   و در mock ترتیب فهرست از قبل «اولی = مبنا» بوده است.
 */
export function pickCapacityTermId(input: {
  terms: readonly CapacityTermRef[];
  semesters: readonly NestSemester[] | undefined;
  kind: CurrentTermKind;
  fallback: 'first' | 'last';
}): string {
  const { terms, semesters, kind, fallback } = input;
  if (terms.length === 0) return '';

  const current = semesters ? pickCurrentSemester(semesters, kind) : null;
  if (current && terms.some((term) => term.id === current.id)) {
    return current.id;
  }

  const fallbackTerm = fallback === 'first' ? terms[0] : terms[terms.length - 1];
  return fallbackTerm?.id ?? '';
}
