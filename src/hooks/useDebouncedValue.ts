'use client';

import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      // Vitest گاهی jsdom را قبل از clearTimeout نابود می‌کند؛ setState آن وقت
      // `window is not defined` می‌دهد و pre-push را می‌شکند.
      if (!active || typeof window === 'undefined') return;
      try {
        setDebounced(value);
      } catch {
        // post-teardown — نادیده بگیر
      }
    }, delayMs);
    return () => {
      active = false;
      if (typeof window !== 'undefined') {
        window.clearTimeout(timer);
      } else {
        clearTimeout(timer);
      }
    };
  }, [value, delayMs]);

  return debounced;
}
