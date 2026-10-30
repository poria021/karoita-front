/**
 * هم‌تراز کردن عنوان استان فرم با کاتالوگ Nest تا «انتخاب همه»
 * به‌خاطر اختلاف جزئی رشته (ی/ک، نیم‌فاصله، trim) نشکند.
 */

export function normalizeProvinceTitle(title: string): string {
  return title
    .trim()
    .replace(/\u200c/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک');
}

/** عنوان‌های انتخاب‌شده را به شکل کانونیکال کاتالوگ برمی‌گرداند؛ یتیم‌ها حفظ می‌شوند. */
export function canonicalizeProvinceTitles(
  selected: readonly string[],
  catalog: readonly string[]
): string[] {
  if (catalog.length === 0) {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const raw of selected) {
      const title = raw.trim();
      if (!title || seen.has(title)) continue;
      seen.add(title);
      out.push(title);
    }
    return out;
  }

  const byNorm = new Map(
    catalog.map((title) => [normalizeProvinceTitle(title), title] as const)
  );
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of selected) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const canonical =
      byNorm.get(normalizeProvinceTitle(trimmed)) ?? trimmed;
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    out.push(canonical);
  }
  return out;
}

/** گزینه‌های سلکت: کاتالوگ + استان ذخیره‌شده‌ای که دیگر در کاتالوگ نیست. */
export function buildProvinceSelectOptions(
  catalog: readonly string[],
  selected: readonly string[]
): Array<{ value: string; label: string }> {
  const canonicalSelected = canonicalizeProvinceTitles(selected, catalog);
  if (catalog.length === 0) {
    return canonicalSelected.map((title) => ({ value: title, label: title }));
  }
  const catalogSet = new Set(catalog);
  const orphans = canonicalSelected.filter((title) => !catalogSet.has(title));
  return [...catalog, ...orphans].map((title) => ({
    value: title,
    label: title,
  }));
}
