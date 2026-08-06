import { persianToEnglishDigits } from '@/utils/persianDigits';

/** Editable score state stays ASCII while accepting Persian/Arabic digits. */
export function normalizeDailyApprovalScoreInput(rawValue: string): string {
  const ascii = persianToEnglishDigits(rawValue).replace(/[^0-9.]/g, '');
  const [whole = '', ...fractionParts] = ascii.split('.');
  if (fractionParts.length === 0) return whole;
  return `${whole}.${fractionParts.join('').slice(0, 2)}`;
}
