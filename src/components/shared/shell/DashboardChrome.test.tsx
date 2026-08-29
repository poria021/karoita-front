import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useUserStore } from '@/store/useUserStore';
import type { User } from '@/types/auth';

vi.mock('@/components/shared/shell/AdminSidebar', () => ({
  AdminSidebar: () => <aside data-testid="admin-rail" />,
}));
vi.mock('@/components/shared/shell/AdminShellHeader', () => ({
  AdminShellHeader: () => <header data-testid="admin-header" />,
}));
vi.mock('@/components/shared/shell/Header', () => ({
  Header: () => <header data-testid="org-header" />,
}));
vi.mock('@/components/shared/shell/Sidebar', () => ({
  Sidebar: () => <aside data-testid="org-rail" />,
}));
vi.mock('@/components/shared/shell/DashboardMainViewport', () => ({
  DashboardMainViewport: ({ children }: { children: ReactNode }) => (
    <main>{children}</main>
  ),
}));

import { DashboardChrome } from '@/components/shared/shell/DashboardChrome';

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

describe('DashboardChrome', () => {
  afterEach(() => {
    cleanup();
    useUserStore.setState({
      activeUser: null,
      isAuthenticated: false,
      hasHydrated: true,
    });
  });

  it.each(['super_admin', 'assistant_admin'] as const)(
    'uses the full-height admin rail for %s',
    (role) => {
      useUserStore.setState({
        activeUser: user(role),
        isAuthenticated: true,
        hasHydrated: true,
      });

      render(
        <DashboardChrome>
          <span>محتوا</span>
        </DashboardChrome>
      );

      expect(screen.getByTestId('admin-rail')).toBeInTheDocument();
      expect(screen.getByTestId('admin-header')).toBeInTheDocument();
      expect(screen.queryByTestId('org-rail')).not.toBeInTheDocument();
      expect(screen.getByText('محتوا')).toBeInTheDocument();
    }
  );

  it('keeps the card sidebar stack for non-admin roles', () => {
    useUserStore.setState({
      activeUser: user('student'),
      isAuthenticated: true,
      hasHydrated: true,
    });

    render(
      <DashboardChrome>
        <span>محتوا</span>
      </DashboardChrome>
    );

    expect(screen.getByTestId('org-rail')).toBeInTheDocument();
    expect(screen.getByTestId('org-header')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-rail')).not.toBeInTheDocument();
  });
});
