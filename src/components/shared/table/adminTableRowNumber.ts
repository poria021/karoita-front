import { toPersianDigits } from '@/utils/persianDigits';

/** Display row number for admin tables (1-based, Persian digits). */
export function adminTableRowNumber(index: number, baseOffset = 0): string {
  const n = Math.max(0, Math.floor(index)) + Math.max(0, Math.floor(baseOffset)) + 1;
  return toPersianDigits(n);
}
