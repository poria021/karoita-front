import { describe, expect, it } from 'vitest';

import {
  PENDING_BG_MAX_PERCENT,
  PENDING_BG_MIN_PERCENT,
  PENDING_FULL_INTENSITY_AT,
  pendingBackground,
  pendingBackgroundPercent,
  pendingIntensity,
} from './pending-card-background';

describe('pending card background', () => {
  it('هرچه گزارش بیشتر، زرد پررنگ‌تر (یکنوا صعودی)', () => {
    const percents = [1, 2, 3, 4, 5].map((n) => pendingBackgroundPercent(n, 5));
    expect(percents).toEqual([...percents].sort((a, b) => a - b));
    expect(new Set(percents).size).toBe(percents.length);
  });

  it('کمترین و بیشترین درصد در بازهٔ مجاز می‌ماند', () => {
    expect(pendingBackgroundPercent(0, 10)).toBe(PENDING_BG_MIN_PERCENT);
    expect(pendingBackgroundPercent(10, 10)).toBe(PENDING_BG_MAX_PERCENT);
    expect(pendingBackgroundPercent(999, 10)).toBe(PENDING_BG_MAX_PERCENT);
    expect(pendingBackgroundPercent(-3, 10)).toBe(PENDING_BG_MIN_PERCENT);
  });

  it('یک کارت تک‌گزارشی پررنگ‌ترین نمی‌شود (کف مقیاس ۵)', () => {
    expect(pendingIntensity(1, 1)).toBeCloseTo(1 / PENDING_FULL_INTENSITY_AT);
    expect(pendingBackgroundPercent(1, 1)).toBeLessThan(PENDING_BG_MAX_PERCENT);
    // با بیشتر شدن بیشینه، مقیاس نسبی می‌شود.
    expect(pendingIntensity(10, 20)).toBe(0.5);
  });

  it('رشتهٔ رنگ زرد را با زمینه ترکیب می‌کند', () => {
    expect(pendingBackground(5, 5)).toContain('color-mix(in srgb');
    expect(pendingBackground(5, 5)).toContain('var(--kv-pending-accent)');
    expect(pendingBackground(5, 5)).toContain('var(--kv-surface)');
    expect(pendingBackground(5, 5)).toContain(`${PENDING_BG_MAX_PERCENT}%`);
  });
});
