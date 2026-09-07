'use client';

import { useEffect, useState } from 'react';

/** تشخیص اینکه اپ در حالت PWA standalone اجرا می‌شود. */
export function usePwaStandalone(): boolean {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(display-mode: standalone)');
    setIsStandalone(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isStandalone;
}
