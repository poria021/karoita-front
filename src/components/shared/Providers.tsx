'use client';

import { DirectionProvider } from '@radix-ui/react-direction';
import { ReactNode } from 'react';

/**
 * Root client-side provider tree for the app.
 *
 * Wraps every child in Radix UI's `<DirectionProvider dir="rtl">` so that
 * Shadcn/Radix primitives rendered through React portals (Dialog, Select,
 * DropdownMenu, Tooltip, etc.) inherit `rtl` direction even though portals
 * mount outside of the root React tree and outside `<html dir="rtl">`'s
 * normal cascade. Per rule 30, direction is statically `rtl` for this app.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return <DirectionProvider dir="rtl">{children}</DirectionProvider>;
}
