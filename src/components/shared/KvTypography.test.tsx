/** @vitest-environment jsdom */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { KvTypography } from './KvTypography';

describe('KvTypography hierarchy', () => {
  it('keeps title above subtitle and body above caption', () => {
    const { container } = render(
      <>
        <KvTypography variant="title">عنوان صفحه</KvTypography>
        <KvTypography variant="subtitle">عنوان بخش</KvTypography>
        <KvTypography variant="body">متن بدنه</KvTypography>
        <KvTypography variant="caption">متن فرعی</KvTypography>
      </>
    );

    const title = screen.getByText('عنوان صفحه');
    const subtitle = screen.getByText('عنوان بخش');
    const body = screen.getByText('متن بدنه');
    const caption = screen.getByText('متن فرعی');

    expect(title.className).toMatch(/text-base/);
    expect(title.className).toMatch(/sm:text-lg/);
    expect(subtitle.className).toMatch(/text-sm/);
    expect(body.className).toMatch(/text-sm/);
    expect(caption.className).toMatch(/text-xs/);
    expect(container.querySelectorAll('[class*="text-"]').length).toBeGreaterThan(0);
  });

  it('keeps chrome variants at the 12px floor', () => {
    render(
      <>
        <KvTypography variant="nav">ناوبری</KvTypography>
        <KvTypography variant="label">برچسب</KvTypography>
        <KvTypography variant="overline">بالانویس</KvTypography>
      </>
    );

    expect(screen.getByText('ناوبری').className).toMatch(/text-xs/);
    expect(screen.getByText('برچسب').className).toMatch(/text-xs/);
    expect(screen.getByText('بالانویس').className).toMatch(/text-xs/);
  });
});
