'use client';

import { config } from '@fortawesome/fontawesome-svg-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { Direction } from 'radix-ui';
import { ThemeProvider } from 'next-themes';
import { useState, type ReactNode } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthTransitionOverlay } from '@/components/shared/shell/AuthTransitionOverlay';
import { DocumentTitleSync } from '@/components/shared/shell/DocumentTitleSync';
import { PwaBoot } from '@/components/shared/shell/PwaBoot';
import { ObservabilityBoot } from '@/lib/observability/ObservabilityBoot';
import { makeQueryClient } from '@/lib/query-client';

config.autoAddCss = false;

/** Apply the stored theme preference and the system default across auth, marketing, and dashboard UI. */
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
        <Direction.Provider dir="rtl">
          <TooltipProvider>
            <ObservabilityBoot />
            <PwaBoot />
            <DocumentTitleSync />
            {children}
            <AuthTransitionOverlay />
          </TooltipProvider>
        </Direction.Provider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}