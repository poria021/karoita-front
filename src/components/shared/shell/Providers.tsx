'use client';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { DirectionProvider } from '@radix-ui/react-direction';
import { ThemeProvider } from 'next-themes';
import { useState, type ReactNode } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { NetworkStatusWatcher } from '@/components/shared/shell/NetworkStatusWatcher';
import { makeQueryClient } from '@/lib/query-client';

config.autoAddCss = false;

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="karvita-theme"
    >
      <QueryClientProvider client={queryClient}>
        <DirectionProvider dir="rtl">
          <TooltipProvider>
            {children}
            <NetworkStatusWatcher />
          </TooltipProvider>
        </DirectionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
