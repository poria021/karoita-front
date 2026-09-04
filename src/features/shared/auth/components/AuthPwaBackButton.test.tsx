import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RouteService } from '@/services/route.service';

import { AuthPwaBackButton } from './AuthPwaBackButton';

const router = vi.hoisted(() => ({
  back: vi.fn(),
  push: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => router,
}));

afterEach(() => {
  router.back.mockReset();
  router.push.mockReset();
  cleanup();
});

describe('AuthPwaBackButton', () => {
  it('goes back when the PWA has history', async () => {
    vi.spyOn(window.history, 'length', 'get').mockReturnValue(3);
    const user = userEvent.setup();
    render(<AuthPwaBackButton />);

    await user.click(screen.getByRole('button', { name: 'بازگشت' }));
    expect(router.back).toHaveBeenCalledOnce();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('falls back to login-select without history', async () => {
    vi.spyOn(window.history, 'length', 'get').mockReturnValue(1);
    const user = userEvent.setup();
    render(<AuthPwaBackButton />);

    await user.click(screen.getByRole('button', { name: 'بازگشت' }));
    expect(router.back).not.toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith(RouteService.marketing.loginSelect());
  });
});
