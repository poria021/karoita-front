import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { KvCheckboxMultiSelect } from './KvCheckboxMultiSelect';

afterEach(() => {
  cleanup();
});

const OPTIONS = [
  { value: 'a', label: 'آلفا' },
  { value: 'b', label: 'بتا' },
  { value: 'c', label: 'گاما' },
];

function Harness({ initial }: { initial: string[] }) {
  const [values, setValues] = useState(initial);
  return (
    <KvCheckboxMultiSelect
      id="test-multi"
      label="نقش‌ها"
      options={OPTIONS}
      values={values}
      selectAllLabel="همه"
      onValuesChange={setValues}
    />
  );
}

describe('KvCheckboxMultiSelect all badge', () => {
  it('shows a single همه badge when every option is selected', () => {
    render(<Harness initial={['a', 'b', 'c']} />);
    expect(screen.getByText('همه')).toBeTruthy();
    expect(screen.queryByText('آلفا')).toBeNull();
    expect(screen.queryByText('بتا')).toBeNull();
    expect(screen.queryByText('گاما')).toBeNull();
  });

  it('still shows همه when values include duplicates or extras', () => {
    render(<Harness initial={['a', 'a', 'b', 'c', 'ghost']} />);
    expect(screen.getByText('همه')).toBeTruthy();
    expect(screen.queryByText('آلفا')).toBeNull();
  });

  it('lists individual badges when selection is partial', () => {
    render(<Harness initial={['a', 'b']} />);
    expect(screen.queryByText('همه')).toBeNull();
    expect(screen.getByText('آلفا')).toBeTruthy();
    expect(screen.getByText('بتا')).toBeTruthy();
  });

  it('clears all values when the همه badge remove is clicked', async () => {
    const user = userEvent.setup();
    render(<Harness initial={['a', 'b', 'c']} />);
    await user.click(screen.getByRole('button', { name: 'حذف همه' }));
    expect(screen.getByText('انتخاب کنید')).toBeTruthy();
  });
});
