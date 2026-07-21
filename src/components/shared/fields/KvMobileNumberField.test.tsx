/** @vitest-environment jsdom */

import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';
import { toPersianDigits } from '@/utils/persianDigits';

afterEach(() => {
  cleanup();
});

function ControlledMobile({
  onEmitted,
}: {
  onEmitted?: (value: string) => void;
}) {
  const [value, setValue] = useState('');
  return (
    <KvMobileNumberField
      id="mobile-field"
      value={value}
      onChange={(event) => {
        onEmitted?.(event.target.value);
        setValue(event.target.value);
      }}
    />
  );
}

describe('KvMobileNumberField', () => {
  it('emits English digits when Persian digits are typed/pasted', () => {
    const onEmitted = vi.fn();
    render(<ControlledMobile onEmitted={onEmitted} />);
    const input = document.getElementById('mobile-field') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '۰۹۱۲۳۴۵۶۷۸' } });

    expect(onEmitted).toHaveBeenLastCalledWith('0912345678');
    expect(input.value).toBe(toPersianDigits('0912345678'));
  });

  it('keeps English digits English in the onChange contract', () => {
    const onEmitted = vi.fn();
    render(<ControlledMobile onEmitted={onEmitted} />);
    const input = document.getElementById('mobile-field') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '9123456789' } });

    expect(onEmitted).toHaveBeenLastCalledWith('9123456789');
    expect(input.value).toBe(toPersianDigits('9123456789'));
  });

  it('wires aria-invalid and error alert via FieldFrame', () => {
    render(
      <KvMobileNumberField
        id="mobile-err"
        value=""
        onChange={() => undefined}
        error="شماره موبایل نامعتبر است"
      />
    );

    const input = document.getElementById('mobile-err') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('mobile-err-error');

    const alert = screen.getByRole('alert');
    expect(alert.id).toBe('mobile-err-error');
    expect(alert.textContent).toContain('شماره موبایل نامعتبر است');
  });
});
