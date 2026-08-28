import type { ReactNode } from 'react';

import { AuthTransitionPaintRelease } from '@/components/shared/shell/AuthTransitionPaintRelease';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <AuthTransitionPaintRelease when="leaving" />
    </>
  );
}
