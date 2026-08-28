/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { KvTableBusy } from './KvTableBusy';

afterEach(() => {
  cleanup();
});

describe('KvTableBusy', () => {
  it('keeps table chrome and shows the data-region spinner caption', () => {
    const { container } = render(
      <table>
        <tbody>
          <KvTableBusy colSpan={3} />
        </tbody>
      </table>
    );

    const status = screen.getByRole('status', {
      name: 'در حال دریافت اطلاعات',
    });
    expect(status.getAttribute('aria-busy')).toBe('true');
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(0);
    expect(status.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText('در حال دریافت اطلاعات')).toBeVisible();
  });
});
