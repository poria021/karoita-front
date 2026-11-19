import { describe, expect, it } from 'vitest';

import { computeFillRatio, fillToneForRatio } from './capacity-status';

describe('capacity-status', () => {
  it('computes a clamped fill ratio', () => {
    expect(computeFillRatio(12, 3)).toBe(0.25);
    expect(computeFillRatio(10, 20)).toBe(1);
    expect(computeFillRatio('unlimited', 5)).toBeNull();
    expect(computeFillRatio(0, 0)).toBeNull();
  });

  it('maps ratios to tones', () => {
    expect(fillToneForRatio(null)).toBe('open');
    expect(fillToneForRatio(0.5)).toBe('calm');
    expect(fillToneForRatio(0.75)).toBe('watch');
    expect(fillToneForRatio(0.95)).toBe('critical');
  });
});
