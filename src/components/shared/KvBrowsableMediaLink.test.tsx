import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { KvBrowsableMediaLink } from './KvBrowsableMediaLink';

const standalone = vi.hoisted(() => ({ current: false }));

vi.mock('@/hooks/usePwaInstall', () => ({
  usePwaStandalone: () => standalone.current,
}));

afterEach(() => {
  standalone.current = false;
  cleanup();
});

describe('KvBrowsableMediaLink', () => {
  it('opens a new-tab link in the browser', () => {
    standalone.current = false;
    render(
      <KvBrowsableMediaLink href="https://cdn.example/doc.jpg" alt="مدرک">
        پیش‌نمایش
      </KvBrowsableMediaLink>
    );

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('https://cdn.example/doc.jpg');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens an in-app lightbox in standalone PWA', async () => {
    standalone.current = true;
    const user = userEvent.setup();
    render(
      <KvBrowsableMediaLink href="https://cdn.example/doc.jpg" alt="مدرک">
        پیش‌نمایش
      </KvBrowsableMediaLink>
    );

    expect(screen.queryByRole('link')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'نمایش تصویر' }));
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByRole('img', { name: 'مدرک' })).toBeDefined();
  });

  it('opens a data-URL image in the lightbox (browsers block data: navigation)', async () => {
    standalone.current = false;
    const user = userEvent.setup();
    render(
      <KvBrowsableMediaLink
        href="data:image/jpeg;base64,/9j/4AAQ"
        alt="مدرک"
      >
        پیش‌نمایش
      </KvBrowsableMediaLink>
    );

    expect(screen.queryByRole('link')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'نمایش تصویر' }));
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByRole('img', { name: 'مدرک' })).toBeDefined();
  });

  it('keeps a new-tab link for non-image media even in PWA', () => {
    standalone.current = true;
    render(
      <KvBrowsableMediaLink
        href="https://cdn.example/doc.pdf"
        previewAsImage={false}
        aria-label="باز کردن مدرک در تب جدید"
      >
        PDF
      </KvBrowsableMediaLink>
    );

    expect(screen.getByRole('link').getAttribute('target')).toBe('_blank');
    expect(screen.queryByRole('button', { name: 'نمایش تصویر' })).toBeNull();
  });
});
