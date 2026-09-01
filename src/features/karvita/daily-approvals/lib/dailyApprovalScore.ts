import { persianToEnglishDigits } from '@/utils/persianDigits';

/** state نمره ASCII می‌ماند؛ رقم فارسی/عربی را هم می‌پذیرد. */
export function normalizeDailyApprovalScoreInput(rawValue: string): string {
  const ascii = persianToEnglishDigits(rawValue).replace(/[^0-9.]/g, '');
  const [whole = '', ...fractionParts] = ascii.split('.');
  if (fractionParts.length === 0) return whole;
  return `${whole}.${fractionParts.join('').slice(0, 2)}`;
}
