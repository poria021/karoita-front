'use client';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { DirectionProvider } from '@radix-ui/react-direction';
import type { ReactNode } from 'react';

import { KvTooltipProvider } from '@/components/shared/KvTooltipProvider';

config.autoAddCss = false;

/**
 * Root client-side provider tree for the app.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <DirectionProvider dir="rtl">
      <KvTooltipProvider>{children}</KvTooltipProvider>
    </DirectionProvider>
  );
}
