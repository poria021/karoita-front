import { describe, expect, it } from 'vitest';

import {
  resolveListSearchQuery,
  SEARCH_DEBOUNCE_MS,
} from './search-debounce';

describe('search-debounce', () => {
  it('exposes 300ms as the product default', () => {
    expect(SEARCH_DEBOUNCE_MS).toBe(300);
  });

  it('clears list query immediately when input is blank', () => {
    expect(resolveListSearchQuery('', 'stale')).toBe('');
    expect(resolveListSearchQuery('   ', 'stale')).toBe('');
  });

  it('keeps debounced value while the user is still typing', () => {
    expect(resolveListSearchQuery('علی', 'عل')).toBe('عل');
    expect(resolveListSearchQuery('علی', 'علی')).toBe('علی');
  });
});
