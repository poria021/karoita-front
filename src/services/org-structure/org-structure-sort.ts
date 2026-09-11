/**
 * مرتب‌سازی الفبایی سمت کلاینت — برای تب‌هایی که `sort` را در OpenAPI ندارند
 * (educations, schools, degreeee, universites؛ ببین admin-catalog.api.ts).
 * فقط آیتم‌های همان صفحهٔ دریافتی را مرتب می‌کند؛ روی `total`/`hasMore` اثر ندارد.
 */
export function sortByNameFa<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, 'fa'));
}
