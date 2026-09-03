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

  it('keeps body overflow visible so sticky chrome stays on the viewport', () => {
    document.body.style.setProperty('overflow', 'hidden', 'important');
    document.body.style.setProperty('margin-right', '15px', 'important');
    document.documentElement.style.setProperty('overflow', 'hidden', 'important');

    acquireKeepPageScroll();

    expect(document.body.style.getPropertyValue('overflow')).toBe('visible');
    expect(document.body.style.getPropertyPriority('overflow')).toBe('important');
    expect(document.body.style.getPropertyValue('margin-right')).toBe('0px');
    expect(document.documentElement.style.getPropertyValue('overflow')).toBe(
      'auto'
    );

    releaseKeepPageScroll();

    expect(document.body.style.getPropertyValue('overflow')).toBe('');
    expect(document.body.style.getPropertyValue('margin-right')).toBe('');
    expect(document.documentElement.style.getPropertyValue('overflow')).toBe('');
  });
});
