'use client';

import { DirectionProvider } from '@radix-ui/react-direction';
import { TooltipProvider } from '@/components/ui/tooltip'; // این خط را اضافه کنید
import { ReactNode } from 'react';

/**
 * Root client-side provider tree for the app.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <DirectionProvider dir="rtl">
      <TooltipProvider> {/* و این خط را */}
        {children}
      </TooltipProvider>
    </DirectionProvider>
  );
}