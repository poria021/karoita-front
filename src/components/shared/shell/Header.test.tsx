import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useUserStore } from '@/store/useUserStore';
import type { User } from '@/types/auth';

vi.mock('@/components/shared/shell/ThemeModeToggle', () => ({
  ThemeModeToggle: () => <span data-testid="theme-toggle" />,
}));
vi.mock('@/components/shared/shell/HeaderNotificationsMenu', () => ({
  HeaderNotificationsMenu: () => <span data-testid="notifications" />,
}));
vi.mock('@/components/shared/shell/UserAccountMenu', () => ({
  UserAccountMenu: () => <span data-testid="account" />,
}));

import { Header } from '@/components/shared/shell/Header';

function user(role: User['role']): User {
  return {
    id: 'u1',
    firstName: 'آزمایش',
    lastName: 'کاربر',
    mobile: '9120000000',
    role,
    approved: true,
    docStatus: 'approved',
  };
}

describe('Header', () => {
  afterEach(() => {
    cleanup();
    useUserStore.setState({
      activeUser: null,
      isAuthenticated: false,
      hasHydrated: true,
    });
  });

  it('aligns learner header content to the same width as the dashboard body', () => {
    useUserStore.setState({
      activeUser: user('student'),
      isAuthenticated: true,
      hasHydrated: true,
    });

    const { container } = render(<Header />);
    const inner = screen.getByRole('banner').querySelector(
      '[data-slot="kv-org-header-inner"]'
    );
    expect(inner).toHaveClass('max-w-[90rem]');
    expect(container.querySelector('header')).not.toHaveClass('max-w-[90rem]');
  });

  it('leaves org-role header content unconstrained', () => {
    useUserStore.setState({
      activeUser: user('supervisor_professor'),
      isAuthenticated: true,
      hasHydrated: true,
    });

    render(<Header />);
    expect(
      screen.getByRole('banner').querySelector('[data-slot="kv-org-header-inner"]')
    ).not.toHaveClass('max-w-[90rem]');
  });
});
