/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  KvFieldFrame,
  resolveFieldLabelMode,
} from '@/components/shared/fields/KvFieldFrame';

afterEach(() => {
  cleanup();
});

describe('resolveFieldLabelMode', () => {
  it('prioritizes locked, then required, then optional', () => {
    expect(
      resolveFieldLabelMode({
        locked: true,
        required: true,
        optionalHint: true,
      })
    ).toBe('locked');
    expect(resolveFieldLabelMode({ required: true })).toBe('required');
    expect(resolveFieldLabelMode({ optionalHint: true })).toBe('optional');
    expect(resolveFieldLabelMode({})).toBe('plain');
  });
});

describe('KvFieldFrame', () => {
  it('associates label, required marker, and error alert', () => {
    render(
      <KvFieldFrame id="name-field" label="نام" required error="الزامی است">
        <input
          id="name-field"
          aria-invalid
          aria-describedby="name-field-error"
        />
      </KvFieldFrame>
    );

    expect(screen.getByLabelText(/نام/)).toBeTruthy();
    expect(screen.getByText('*')).toBeTruthy();

    const alert = screen.getByRole('alert');
    expect(alert.id).toBe('name-field-error');
    expect(alert.textContent).toContain('الزامی است');
  });

  it('shows lock icon when locked with showLockIcon', () => {
    const { container } = render(
      <KvFieldFrame id="locked-field" label="کد ملی" locked showLockIcon>
        <input id="locked-field" disabled readOnly />
      </KvFieldFrame>
    );

    const input = screen.getByLabelText(/کد ملی/) as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
