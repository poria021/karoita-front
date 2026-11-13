'use client';

import { useCallback, useMemo, useState } from 'react';

import { HUB_INBOX_PAGE_SIZE } from '@/services/bulletins/bulletin-rules';

type Identifiable = { id?: string };

/**
 * پنجرهٔ ۲۰تایی روی آرایهٔ کامل (وقتی API صفحه‌بندی ندارد).
 * با اسکرول نزدیک ته لیست، `revealMore` را صدا بزنید.
 */
export function useProgressiveListWindow<T extends Identifiable>(
  items: readonly T[],
  pageSize: number = HUB_INBOX_PAGE_SIZE
) {
  const resetKey = useMemo(() => {
    const first = items[0]?.id ?? '';
    const last = items[items.length - 1]?.id ?? '';
    return `${items.length}:${first}:${last}`;
  }, [items]);

  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [seenResetKey, setSeenResetKey] = useState(resetKey);

  // وقتی منبع لیست عوض شد، پنجره را بدون effect ریست کن (الگوی React).
  if (seenResetKey !== resetKey) {
    setSeenResetKey(resetKey);
    setVisibleCount(pageSize);
  }

  const visible = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const revealMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + pageSize, items.length));
  }, [items.length, pageSize]);

  return { visible, hasMore, revealMore, total: items.length };
}

/** نزدیک ته ظرف اسکرول → بارگذاری دستهٔ بعدی. */
export function isNearScrollEnd(
  el: HTMLElement,
  thresholdPx = 48
): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight < thresholdPx;
}
