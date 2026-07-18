import { describe, expect, it } from 'vitest';

import { resolveKvButtonSize } from '@/components/shared/KvButton';

describe('resolveKvButtonSize', () => {
  it('passes text sizes through when not icon-only', () => {
    expect(resolveKvButtonSize('sm', false)).toBe('sm');
    expect(resolveKvButtonSize('md', false)).toBe('md');
    expect(resolveKvButtonSize('lg', false)).toBe('lg');
  });

  it('maps text density to square icon sizes when icon-only', () => {
    expect(resolveKvButtonSize('sm', true)).toBe('icon-sm');
    expect(resolveKvButtonSize('md', true)).toBe('icon');
    expect(resolveKvButtonSize('lg', true)).toBe('icon-lg');
  });

  it('keeps explicit icon sizes unchanged', () => {
    expect(resolveKvButtonSize('icon-sm', true)).toBe('icon-sm');
    expect(resolveKvButtonSize('icon', true)).toBe('icon');
    expect(resolveKvButtonSize('icon-lg', true)).toBe('icon-lg');
    expect(resolveKvButtonSize('icon-sm', false)).toBe('icon-sm');
  });
});
