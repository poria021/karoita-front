import { describe, expect, it } from 'vitest';

import {
  toNestTitleFilterSearchParams,
  toSearchParams,
} from '@/services/nest-search-params';

describe('toSearchParams', () => {
  it('drops empty and undefined values', () => {
    expect(toSearchParams({ page: 1, title: '', q: undefined })).toEqual({
      page: 1,
    });
  });
});

describe('toNestTitleFilterSearchParams', () => {
  it('always sends a JSON filters object so Nest JSON.parse does not 500', () => {
    expect(toNestTitleFilterSearchParams({ page: 1, limit: 20 })).toEqual({
      page: 1,
      limit: 20,
      filters: '{}',
    });
  });

  it('wraps a title search as {"title":"..."}', () => {
    expect(
      toNestTitleFilterSearchParams({ page: 1, limit: 20, filters: 'تهر' })
    ).toEqual({
      page: 1,
      limit: 20,
      filters: '{"title":"تهر"}',
    });
  });
});
