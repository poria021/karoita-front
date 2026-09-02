import { afterEach, describe, expect, it } from 'vitest';

import {
  acquireKeepPageScroll,
  releaseKeepPageScroll,
  resetKeepPageScrollForTests,
} from './keepPageScroll';

describe('keepPageScroll', () => {
  afterEach(() => {
    resetKeepPageScrollForTests();
  });

  it('overrides body overflow lock with inline important styles', () => {
    document.body.style.setProperty('overflow', 'hidden', 'important');
    document.body.style.setProperty('margin-right', '15px', 'important');

    acquireKeepPageScroll();

    expect(document.body.style.getPropertyValue('overflow')).toBe('auto');
    expect(document.body.style.getPropertyPriority('overflow')).toBe('important');
    expect(document.body.style.getPropertyValue('margin-right')).toBe('0px');

    releaseKeepPageScroll();

    expect(document.body.style.getPropertyValue('overflow')).toBe('');
    expect(document.body.style.getPropertyValue('margin-right')).toBe('');
  });
});
