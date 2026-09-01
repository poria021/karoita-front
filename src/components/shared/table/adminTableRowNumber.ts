import { toPersianDigits } from '@/utils/persianDigits';

/** شمارهٔ ردیف جداول ادمین (از ۱، رقم فارسی). */
export function adminTableRowNumber(index: number, baseOffset = 0): string {
  const n = Math.max(0, Math.floor(index)) + Math.max(0, Math.floor(baseOffset)) + 1;
  return toPersianDigits(n);
}
