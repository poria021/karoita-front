/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ChangeEvent } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { OtpCodeField } from '@/features/shared/auth/components/fields/OtpCodeField';
import { toPersianDigits } from '@/utils/persianDigits';

afterEach(() => {
  cleanup();
});

function mockOtpRegistration(
  onChange: UseFormRegisterReturn<'otp'>['onChange'] = vi.fn()
): UseFormRegisterReturn<'otp'> {
  return {
    name: 'otp',
    onBlur: vi.fn(),
    onChange,
    ref: vi.fn(),
  };
}

describe('OtpCodeField', () => {
  it('normalizes Persian digits to English before RHF onChange', () => {
    const emitted: string[] = [];
    const onChange = vi.fn((event: ChangeEvent<HTMLInputElement>) => {
      emitted.push(event.target.value);
      return Promise.resolve();
    });
    render(
      <OtpCodeField id="otp-field" registration={mockOtpRegistration(onChange)} />
    );
    const input = document.getElementById('otp-field') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '۱۲۳۴۵' } });

    expect(emitted.at(-1)).toBe('12345');
    expect(input.value).toBe(toPersianDigits('12345'));
  });

  it('accepts English digits and caps at 5', () => {
    const emitted: string[] = [];
    const onChange = vi.fn((event: ChangeEvent<HTMLInputElement>) => {
      emitted.push(event.target.value);
      return Promise.resolve();
    });
    render(
      <OtpCodeField id="otp-field" registration={mockOtpRegistration(onChange)} />
    );
    const input = document.getElementById('otp-field') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '987654321' } });

    expect(emitted.at(-1)).toBe('98765');
    expect(input.value).toBe(toPersianDigits('98765'));
  });

  it('keeps autoComplete="one-time-code" and error alert wiring', () => {
    render(
      <OtpCodeField
        id="otp-a11y"
        registration={mockOtpRegistration()}
        errorMessage="کد تایید نامعتبر است"
      />
    );
    const input = document.getElementById('otp-a11y') as HTMLInputElement;

    expect(input.getAttribute('autoComplete')).toBe('one-time-code');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('otp-a11y-error');
    expect(screen.getByRole('alert').textContent).toContain(
      'کد تایید نامعتبر است'
    );
  });
});
