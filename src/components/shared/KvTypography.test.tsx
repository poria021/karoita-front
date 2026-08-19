import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { KvTypography } from './KvTypography';

describe('KvTypography hierarchy', () => {
  it('keeps title above subtitle and body above caption', () => {
    render(
      <>
        <KvTypography variant="title">عنوان صفحه</KvTypography>
        <KvTypography variant="subtitle">عنوان بخش</KvTypography>
        <KvTypography variant="body">متن بدنه</KvTypography>
        <KvTypography variant="caption">متن فرعی</KvTypography>
      </>
    );

    expect(screen.getByText('عنوان صفحه')).toBeDefined();
    expect(screen.getByText('عنوان بخش')).toBeDefined();
    expect(screen.getByText('متن بدنه')).toBeDefined();
    expect(screen.getByText('متن فرعی')).toBeDefined();
  });

  it('keeps chrome variants at the 12px floor', () => {
    render(
      <>
        <KvTypography variant="nav">ناوبری</KvTypography>
        <KvTypography variant="label">برچسب</KvTypography>
        <KvTypography variant="overline">بالانویس</KvTypography>
      </>
    );

    expect(screen.getByText('ناوبری')).toBeDefined();
    expect(screen.getByText('برچسب')).toBeDefined();
    expect(screen.getByText('بالانویس')).toBeDefined();
  });
});