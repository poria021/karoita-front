import { describe, expect, it } from 'vitest';

import {
  isSameOriginPathNavigation,
  resolveInternalPathNavAnchor,
} from '@/lib/navigation-progress';

describe('isSameOriginPathNavigation', () => {
  it('accepts same-origin pathname changes', () => {
    expect(
      isSameOriginPathNavigation(
        'https://app.local/karvita/capacities',
        'https://app.local',
        '/karvita/dashboard'
      )
    ).toBe(true);
  });

  it('rejects query-only and hash-only changes on the same path', () => {
    expect(
      isSameOriginPathNavigation(
        'https://app.local/karvita/capacities?kind=internship',
        'https://app.local',
        '/karvita/capacities'
      )
    ).toBe(false);
  });

  it('rejects external origins and unparseable hrefs', () => {
    expect(
      isSameOriginPathNavigation(
        'https://other.example/x',
        'https://app.local',
        '/karvita/dashboard'
      )
    ).toBe(false);
    expect(
      isSameOriginPathNavigation(
        'https://app.local:not-a-port/x',
        'https://app.local',
        '/karvita/dashboard'
      )
    ).toBe(false);
  });
});

describe('resolveInternalPathNavAnchor', () => {
  it('finds a nested same-origin path link', () => {
    const anchor = document.createElement('a');
    anchor.href = 'https://example.test/karvita/capacities';
    const span = document.createElement('span');
    anchor.appendChild(span);
    document.body.appendChild(anchor);

    const found = resolveInternalPathNavAnchor(
      span,
      'https://example.test',
      '/karvita/dashboard'
    );
    expect(found).toBe(anchor);

    anchor.remove();
  });

  it('ignores download, new-tab, and hash links', () => {
    const download = document.createElement('a');
    download.href = 'https://example.test/file.pdf';
    download.setAttribute('download', '');
    expect(
      resolveInternalPathNavAnchor(
        download,
        'https://example.test',
        '/karvita/dashboard'
      )
    ).toBeNull();

    const blank = document.createElement('a');
    blank.href = 'https://example.test/karvita/capacities';
    blank.target = '_blank';
    expect(
      resolveInternalPathNavAnchor(
        blank,
        'https://example.test',
        '/karvita/dashboard'
      )
    ).toBeNull();

    const hash = document.createElement('a');
    hash.setAttribute('href', '#section');
    expect(
      resolveInternalPathNavAnchor(
        hash,
        'https://example.test',
        '/karvita/dashboard'
      )
    ).toBeNull();
  });
});
