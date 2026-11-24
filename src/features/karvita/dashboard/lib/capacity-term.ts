import type { NestSemester } from '@/types/nest-admin';

import { pickCurrentSemester, type CurrentTermKind } from './current-terms';

type CapacityTermRef = { id: string };

/**
 * ترمِ مبنای ظرفیت در میز کار استاد راهنما:
 * - ترم جاری («آخرین نیم‌سال باز»: کلاس‌ها شروع شده > انتخاب واحد باز) با همان
 *   قاعدهٔ باکس خوش‌آمد.
 * - اگر ترم جاری پیدا نشد (یا در فهرست ظرفیت نبود):
 *   - `none` (real): رشتهٔ خالی؛ نیم‌سال باز نیست پس ظرفیتی نشان داده نمی‌شود.
 *   - `first` (mock: ترتیب فهرست از قبل «اولی = مبنا» بوده) یا `last`.
 */
export function pickCapacityTermId(input: {
  terms: readonly CapacityTermRef[];
  semesters: readonly NestSemester[] | undefined;
  kind: CurrentTermKind;
  fallback: 'first' | 'last' | 'none';
}): string {
  const { terms, semesters, kind, fallback } = input;
  if (terms.length === 0) return '';

  const current = semesters ? pickCurrentSemester(semesters, kind) : null;
  if (current && terms.some((term) => term.id === current.id)) {
    return current.id;
  }

  if (fallback === 'none') return '';
  const fallbackTerm = fallback === 'first' ? terms[0] : terms[terms.length - 1];
  return fallbackTerm?.id ?? '';
}
