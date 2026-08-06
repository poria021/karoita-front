/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';

afterEach(() => {
  cleanup();
});

describe('AppTabs', () => {
  it('renders labeled tablist and switches value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <AppTabs value="internship" onValueChange={onValueChange} gridCols={2}>
        <AppTabsList aria-label="نوع ظرفیت پذیرش">
          <AppTabsTrigger value="internship">ظرفیت کارورزی</AppTabsTrigger>
          <AppTabsTrigger value="apprenticeship">ظرفیت کارآموزی</AppTabsTrigger>
        </AppTabsList>
      </AppTabs>
    );

    expect(
      screen.getByRole('tablist', { name: 'نوع ظرفیت پذیرش' })
    ).toBeTruthy();
    await user.click(screen.getByRole('tab', { name: 'ظرفیت کارآموزی' }));
    expect(onValueChange).toHaveBeenCalledWith('apprenticeship');
  });
});
