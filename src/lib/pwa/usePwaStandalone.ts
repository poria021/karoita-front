'use client';

import { useEffect, useState } from 'react';

/** تشخیص اینکه اپ در حالت PWA standalone اجرا می‌شود. */
export function usePwaStandalone(): boolean {
  const [isStandalone, setIsStandalone] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
  );

  useEffect(() => {
    const mql = window.matchMedia('(display-mode: standalone)');
    const handler = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isStandalone;
}
