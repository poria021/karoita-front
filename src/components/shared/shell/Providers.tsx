'use client';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { DirectionProvider } from '@radix-ui/react-direction';
import { ThemeProvider } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { makeQueryClient } from '@/lib/query-client';
import { isAppShellPath } from '@/services/route.service';

config.autoAddCss = false;

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  const pathname = usePathname();
  const isDashboardShell = isAppShellPath(pathname ?? '');

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={isDashboardShell}
      forcedTheme={isDashboardShell ? undefined : 'light'}
      disableTransitionOnChange
      storageKey="karvita-theme"
    >
      <QueryClientProvider client={queryClient}>
        <DirectionProvider dir="rtl">
          <TooltipProvider>{children}</TooltipProvider>
        </DirectionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
