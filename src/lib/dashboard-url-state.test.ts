import { describe, expect, it } from 'vitest';

import {
  appendSearchParam,
  hrefWithSearchParam,
  pickAllowedSearchParam,
} from '@/lib/dashboard-url-state';

const TABS = ['provinces', 'cities', 'districts'] as const;

describe('dashboard-url-state', () => {
  it('pickAllowedSearchParam accepts allowlisted values', () => {
    expect(pickAllowedSearchParam('cities', TABS, 'provinces')).toBe('cities');
  });

  it('pickAllowedSearchParam falls back for missing or invalid', () => {
    expect(pickAllowedSearchParam(null, TABS, 'provinces')).toBe('provinces');
    expect(pickAllowedSearchParam('nope', TABS, 'provinces')).toBe('provinces');
  });

  it('hrefWithSearchParam sets and deletes keys', () => {
    const current = new URLSearchParams('q=x');
    expect(hrefWithSearchParam('/karvita/admin/organizational-structure', current, 'tab', 'cities')).toBe(
      '/karvita/admin/organizational-structure?q=x&tab=cities'
    );
    expect(
      hrefWithSearchParam(
        '/karvita/admin/organizational-structure',
        new URLSearchParams('tab=cities&q=x'),
        'tab',
        null
      )
    ).toBe('/karvita/admin/organizational-structure?q=x');
  });

  it('hrefWithSearchParam returns bare pathname when search empty', () => {
    expect(
      hrefWithSearchParam('/p', new URLSearchParams('tab=cities'), 'tab', null)
    ).toBe('/p');
  });

  it('appendSearchParam merges onto existing query', () => {
    expect(appendSearchParam('/karvita/admin/x', 'tab', 'cities')).toBe(
      '/karvita/admin/x?tab=cities'
    );
    expect(appendSearchParam('/karvita/admin/x?foo=1', 'tab', 'cities')).toBe(
      '/karvita/admin/x?foo=1&tab=cities'
    );
  });
});
