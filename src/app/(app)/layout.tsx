import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { AppAuthGuard } from '@/components/shared/shell/AppAuthGuard';
import { DashboardMainViewport } from '@/components/shared/shell/DashboardMainViewport';
import { Header } from '@/components/shared/shell/Header';
import { HydrationSafe } from '@/components/shared/shell/HydrationSafe';
import { Sidebar } from '@/components/shared/shell/Sidebar';
import { SkipToMainContent } from '@/components/shared/shell/SkipToMainContent';
import { kvShellContentPadXClassName } from '@/components/shared/shell/shellChrome';
import { cn } from '@/lib/utils';

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
            <SkipToMainContent />
            <Header />
            <div
              className={cn(
                'relative flex w-full flex-1 flex-col items-stretch gap-kv-group lg:flex-row',
                kvShellContentPadXClassName
              )}
            >
              <Sidebar />
              <DashboardMainViewport>{children}</DashboardMainViewport>
            </div>
          </div>
        </AppAuthGuard>
      </Suspense>
    </HydrationSafe>
  );
}
