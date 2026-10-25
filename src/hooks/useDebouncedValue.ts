'use client';

import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      // بعد از unmount / teardown تست setState نزن — وگرنه Vitest unhandled error می‌دهد.
      if (!active) return;
      setDebounced(value);
    }, delayMs);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debounced;
}
