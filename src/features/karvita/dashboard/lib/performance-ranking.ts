import type { ReportRow } from '@/types/reports';

export type PerformanceRankingEntity =
  | 'province'
  | 'faculty'
  | 'school'
  | 'professor';
export type PerformanceRankingDirection = 'weak' | 'strong';

/**
 * تعداد ردیف هر باکس عملکرد روی میز کار:
 * ۳ استان/دانشکده، ۵ مدرسه (منطقه)، ۵ استاد (دانشکده).
 */
export const PERFORMANCE_RANKING_LIMITS: Record<PerformanceRankingEntity, number> =
  { province: 3, faculty: 3, school: 5, professor: 5 };

export function rankingLimitFor(entity: PerformanceRankingEntity): number {
  return PERFORMANCE_RANKING_LIMITS[entity];
}

export type PerformanceRankingItem = {
  id: string;
  rank: number;
  name: string;
  /** استان: مدیر دانشگاه استانی — دانشکده: استان / شهر — مدرسه: منطقه / شهر. */
  subtitle?: string;
  /** میانگین نمرهٔ فراگیران — معیار رتبه‌بندی. */
  score: number;
  /** درصد حضور اساتید. */
  attendance?: number;
  /** نرخ پاسخ‌دهی. */
  response?: number;
};

/** ضعیف‌ترین‌ها از کم به زیاد؛ قوی‌ترین‌ها از زیاد به کم. */
export function sortOrderFor(
  direction: PerformanceRankingDirection
): 'asc' | 'desc' {
  return direction === 'weak' ? 'asc' : 'desc';
}

/** مقدار عددی یا صفر؛ مثل جدول گزارش، ردیفِ بدون داده «۰» حساب می‌شود. */
function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function subtitleFor(
  entity: PerformanceRankingEntity,
  row: ReportRow
): string | undefined {
  const parts =
    entity === 'province'
      ? [row.head]
      : entity === 'school'
        ? [row.regionName, row.cityName]
        : entity === 'professor'
          ? [row.code, row.facName]
          : [row.provName, row.cityName];
  const text = parts.filter(Boolean).join(' · ');
  return text || undefined;
}

/**
 * ردیف‌های بدون `averageScore` (null) هم با نمرهٔ ۰ می‌آیند (مثل جدول)؛
 * بر اساس نمره رتبه‌بندی می‌شود و در نمرهٔ مساوی ترتیب نام فارسی است.
 */
export function pickRankingItems(
  entity: PerformanceRankingEntity,
  rows: readonly ReportRow[],
  direction: PerformanceRankingDirection,
  limit: number = rankingLimitFor(entity)
): PerformanceRankingItem[] {
  const sorted = [...rows].sort((a, b) => {
    const diff = numberOrZero(a.score) - numberOrZero(b.score);
    if (diff !== 0) return direction === 'weak' ? diff : -diff;
    return String(a.name ?? '').localeCompare(String(b.name ?? ''), 'fa');
  });
  return sorted.slice(0, limit).map((row, index) => ({
    id: row.id,
    rank: index + 1,
    name: row.name?.trim() || '—',
    subtitle: subtitleFor(entity, row),
    score: numberOrZero(row.score),
    attendance: numberOrZero(row.att),
    response: numberOrZero(row.resp),
  }));
}

export const PERFORMANCE_RANKING_META: Record<
  PerformanceRankingEntity,
  {
    slug:
      | 'province-performance'
      | 'faculty-performance'
      | 'school-performance'
      | 'professor-performance';
    noun: string;
  }
> = {
  province: { slug: 'province-performance', noun: 'استان‌ها' },
  faculty: { slug: 'faculty-performance', noun: 'دانشکده‌ها' },
  school: { slug: 'school-performance', noun: 'مدارس' },
  professor: { slug: 'professor-performance', noun: 'اساتید' },
};
