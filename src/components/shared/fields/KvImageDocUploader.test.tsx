import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { KvImageDocUploader } from './KvImageDocUploader';

const standalone = vi.hoisted(() => ({ current: false }));

vi.mock('@/hooks/usePwaInstall', () => ({
  usePwaStandalone: () => standalone.current,
}));

afterEach(() => {
  standalone.current = false;
  cleanup();
});

function Harness({ existingUrl }: { existingUrl: string }) {
  const [file, setFile] = useState<File | null>(null);
  return (
    <KvImageDocUploader
      value={file}
      existingUrl={existingUrl}
      onChange={(next) => setFile(next)}
      compress={false}
      previewAlt="پیش‌نمایش مدرک ارسالی"
    />
  );
}

describe('KvImageDocUploader', () => {
  it('clears an existing preview so a replacement image can be chosen', async () => {
    const user = userEvent.setup();
    render(<Harness existingUrl="https://cdn.example/id-doc.jpg" />);

    expect(screen.getByAltText('پیش‌نمایش مدرک ارسالی')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'حذف' }));

    expect(screen.queryByAltText('پیش‌نمایش مدرک ارسالی')).toBeNull();
    expect(screen.getByText('کلیک یا رها کردن تصویر')).toBeTruthy();
  });
});
