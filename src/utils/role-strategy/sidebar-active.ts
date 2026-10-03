/**
 * فعال‌بودن آیتم سایدبار با query. مسیر بدون پارامتر مثل قبل فقط با `pathname`
 * جور می‌شود؛ مسیر با پارامتر (`?kind=…&course=…`) باید همه‌ی پارامترهایش در URL فعلی باشد.
 * بین چند کاندید، آیتم با پارامتر بیشتر (دقیق‌تر) برنده است تا دو آیتم هم‌زمان روشن نشوند.
 */
function splitPath(path: string): { base: string; params: URLSearchParams } {
  const hashIndex = path.indexOf('#');
  const noHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const qIndex = noHash.indexOf('?');
  return {
    base: qIndex >= 0 ? noHash.slice(0, qIndex) : noHash,
    params: new URLSearchParams(qIndex >= 0 ? noHash.slice(qIndex + 1) : ''),
  };
}

export function resolveActiveSidebarPath(
  paths: readonly string[],
  pathname: string,
  search: string
): string | null {
  const current = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search
  );
  let best: { path: string; weight: number } | null = null;

  for (const path of paths) {
    const { base, params } = splitPath(path);
    if (base !== pathname) continue;
    let matches = true;
    let weight = 0;
    for (const [key, value] of params) {
      if (current.get(key) !== value) {
        matches = false;
        break;
      }
      weight += 1;
    }
    if (matches && (best === null || weight > best.weight)) {
      best = { path, weight };
    }
  }
  return best?.path ?? null;
}
