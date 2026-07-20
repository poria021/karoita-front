import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { AppAuthGuard } from '@/components/shared/shell/AppAuthGuard';
import { DashboardMainViewport } from '@/components/shared/shell/DashboardMainViewport';
import { Header } from '@/components/shared/shell/Header';
import HydrationSafe from '@/components/shared/shell/HydrationSafe';
import { Sidebar } from '@/components/shared/shell/Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

function AuthShellPlaceholder() {
  return (
    <div
      className="min-h-dvh w-full bg-kv-canvas"
      aria-busy="true"
      aria-live="polite"
    />
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <HydrationSafe>
      <Suspense fallback={<AuthShellPlaceholder />}>
        <AppAuthGuard>
          <div className="flex min-h-dvh w-full flex-col bg-kv-canvas">
            <Header />
            <div className="relative flex w-full flex-1 flex-col items-stretch gap-kv-group px-0 py-kv-group sm:px-6 lg:flex-row lg:px-6 lg:py-kv-group xl:px-8 2xl:px-16">
              <Sidebar />
              <DashboardMainViewport>{children}</DashboardMainViewport>
            </div>
          </div>
        </AppAuthGuard>
      </Suspense>
    </HydrationSafe>
  );
}
