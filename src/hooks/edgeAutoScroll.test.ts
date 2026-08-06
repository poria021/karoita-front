import { describe, expect, it } from 'vitest';

import { computeEdgeScrollVelocity } from './edgeAutoScroll';

describe('computeEdgeScrollVelocity', () => {
  it('returns 0 in the middle of the list', () => {
    expect(
      computeEdgeScrollVelocity({
        offsetY: 100,
        height: 200,
        edgeSize: 32,
        maxSpeed: 14,
      })
    ).toBe(0);
  });

  it('scrolls up near the top edge with rising intensity', () => {
    const nearTop = computeEdgeScrollVelocity({
      offsetY: 8,
      height: 200,
      edgeSize: 32,
      maxSpeed: 14,
    });
    const atTop = computeEdgeScrollVelocity({
      offsetY: 0,
      height: 200,
      edgeSize: 32,
      maxSpeed: 14,
    });

    expect(nearTop).toBeLessThan(0);
    expect(atTop).toBe(-14);
    expect(atTop).toBeLessThan(nearTop);
  });

  it('scrolls down near the bottom edge with rising intensity', () => {
    const nearBottom = computeEdgeScrollVelocity({
      offsetY: 192,
      height: 200,
      edgeSize: 32,
      maxSpeed: 14,
    });
    const atBottom = computeEdgeScrollVelocity({
      offsetY: 200,
      height: 200,
      edgeSize: 32,
      maxSpeed: 14,
    });

    expect(nearBottom).toBeGreaterThan(0);
    expect(atBottom).toBe(14);
    expect(atBottom).toBeGreaterThan(nearBottom);
  });

  it('clamps edge size when the list is shorter than 2× edge', () => {
    expect(
      computeEdgeScrollVelocity({
        offsetY: 0,
        height: 40,
        edgeSize: 32,
        maxSpeed: 10,
      })
    ).toBe(-10);
  });
});
