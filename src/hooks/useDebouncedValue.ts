'use client';

import { useEffect, useState } from 'react';

/** Debounce any value — shared by org table search and similar filters.
 * Skips the timer when the value is already current (avoids a useless
 * remount/reload tick on first paint).
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (Object.is(value, debounced)) return;
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs, debounced]);

  return debounced;
}
