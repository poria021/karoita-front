import { persianToEnglishDigits } from '@/utils/persianDigits';

/** سطح ۱–۴ را از عنوان درس (مثلاً «کارورزی ۲») می‌خواند. */
export function lessonLevelFromTitle(title: string): 1 | 2 | 3 | 4 {
  const match = persianToEnglishDigits(title).match(/([1-4])/);
  if (!match) return 1;
  return Number(match[1]) as 1 | 2 | 3 | 4;
}
