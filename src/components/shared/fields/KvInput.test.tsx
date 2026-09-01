/** @vitest-environment jsdom */

import { useState } from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { KvInput } from '@/components/shared/fields/KvInput';
import { toPersianDigits } from '@/utils/persianDigits';

afterEach(() => {
  cleanup();
});

function ControlledNumber({
  onEmitted,
}: {
  onEmitted?: (value: string) => void;
}) {
  const [value, setValue] = useState('15');
  return (
    <KvInput
      id="number-field"
      type="number"
      value={value}
      onChange={(event) => {
        onEmitted?.(event.target.value);
        setValue(event.target.value);
      }}
    />
  );
}

describe('KvInput type=number', () => {
  it('shows Persian digits and emits English on change', () => {
    const onEmitted = vi.fn();
    render(<ControlledNumber onEmitted={onEmitted} />);
    const input = document.getElementById('number-field') as HTMLInputElement;

    expect(input.type).toBe('text');
    expect(input.inputMode).toBe('numeric');
    expect(input.value).toBe(toPersianDigits('15'));

    fireEvent.change(input, { target: { value: '۲۰' } });
    expect(onEmitted).toHaveBeenLastCalledWith('20');
    expect(input.value).toBe(toPersianDigits('20'));
  });
});
