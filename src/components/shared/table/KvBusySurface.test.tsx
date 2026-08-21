/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { KvBusySurface } from './KvBusySurface';

afterEach(() => {
  cleanup();
});

describe('KvBusySurface', () => {
  it('exposes a busy status region with a spinner and a visible caption', () => {
    const { container } = render(<KvBusySurface />);

    const status = screen.getByRole('status', {
      name: 'در حال دریافت اطلاعات',
    });
    expect(status.getAttribute('aria-busy')).toBe('true');
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(0);
    expect(status.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText('در حال دریافت اطلاعات')).toBeVisible();
  });
});
