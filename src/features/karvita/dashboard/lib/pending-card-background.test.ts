import { describe, expect, it } from 'vitest';

import {
  PENDING_BG_MAX_PERCENT,
  PENDING_BG_MIN_PERCENT,
  PENDING_FULL_INTENSITY_AT,
  pendingBackground,
  pendingBackgroundPercent,
  pendingIntensity,
} from './pending-card-background';

describe('pending-card-background', () => {
  it('scales intensity from zero up to the full-intensity floor', () => {
    expect(pendingIntensity(0, 10)).toBe(0);
    expect(pendingIntensity(PENDING_FULL_INTENSITY_AT, 3)).toBe(1);
    expect(pendingIntensity(10, 10)).toBe(1);
    expect(pendingIntensity(1, 10)).toBeCloseTo(0.1);
  });

  it('maps intensity to pale-to-strong yellow mix percents', () => {
    expect(pendingBackgroundPercent(0, 10)).toBe(PENDING_BG_MIN_PERCENT);
    expect(pendingBackgroundPercent(10, 10)).toBe(PENDING_BG_MAX_PERCENT);
  });

  it('builds a color-mix background against the surface token', () => {
    expect(pendingBackground(5, 5)).toContain('color-mix(in srgb');
    expect(pendingBackground(5, 5)).toContain('var(--kv-surface)');
    expect(pendingBackground(5, 5)).toContain(`${PENDING_BG_MAX_PERCENT}%`);
  });
});
