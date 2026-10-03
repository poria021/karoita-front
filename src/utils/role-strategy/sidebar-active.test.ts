import { describe, expect, it } from 'vitest';

import { resolveActiveSidebarPath } from './sidebar-active';

describe('resolveActiveSidebarPath', () => {
  it('matches param-less paths by pathname only', () => {
    expect(
      resolveActiveSidebarPath(['/a', '/b'], '/b', '?kind=internship')
    ).toBe('/b');
    expect(resolveActiveSidebarPath(['/a'], '/c', '')).toBeNull();
  });

  it('requires every param of a path and prefers the most specific match', () => {
    const paths = [
      '/k/d?kind=internship',
      '/k/d?kind=internship&course=c1',
      '/k/d?kind=internship&course=c2',
      '/k/d?kind=apprenticeship',
    ];
    expect(
      resolveActiveSidebarPath(paths, '/k/d', '?kind=internship&course=c2')
    ).toBe('/k/d?kind=internship&course=c2');
    expect(resolveActiveSidebarPath(paths, '/k/d', '?kind=internship')).toBe(
      '/k/d?kind=internship'
    );
    expect(
      resolveActiveSidebarPath(
        paths,
        '/k/d',
        '?kind=apprenticeship&course=zzz'
      )
    ).toBe('/k/d?kind=apprenticeship');
    expect(resolveActiveSidebarPath(paths, '/k/d', '')).toBeNull();
  });
});
