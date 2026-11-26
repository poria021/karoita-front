type TermRef = { id: string; ended?: boolean };

/**
 * ترم پیش‌فرض صفحهٔ ارزیابی گزارش‌ها.
 * - اگر فهرست پرچم `ended` دارد (فراگیر): آخرین ترم بازِ فهرست.
 * - وگرنه (استاد/معلم/مدیر): در real فهرست ترم‌ها به ترتیب درج است و آخرین عنصر
 *   جدیدترین ترم است؛ اولین عنصر قدیمی‌ترین ترم است و فراگیرِ تازه‌ثبت‌نام‌شده
 *   آنجا نیست. در mock ترتیب فهرست از قبل «اولی = مبنا» است.
 */
export function pickDefaultTermId(
  terms: readonly TermRef[],
  options: { newestLast: boolean }
): string {
  if (terms.length === 0) return '';
  for (let index = terms.length - 1; index >= 0; index -= 1) {
    const term = terms[index];
    if (term && term.ended === false) return term.id;
  }
  const fallback = options.newestLast ? terms[terms.length - 1] : terms[0];
  return fallback?.id ?? '';
}
