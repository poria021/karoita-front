/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { KvBusySurface } from './KvBusySurface';

afterEach(() => {
  cleanup();
});

describe('KvBusySurface', () => {
  it('exposes a busy status region with skeleton bones', () => {
    const { container } = render(<KvBusySurface />);

    const status = screen.getByRole('status', { name: 'در حال بارگذاری' });
    expect(status.getAttribute('aria-busy')).toBe('true');
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(
      2
    );
  });
});
