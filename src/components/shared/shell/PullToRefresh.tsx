'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { FaIcon } from '@/components/shared/FaIcon';
import { usePwaStandalone } from '@/lib/pwa/usePwaStandalone';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

const THRESHOLD = 72; // px برای فعال شدن refresh
const MAX_PULL = 96;  // حداکثر کشش نمایشی

interface PullToRefreshProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * پوشش pull-to-refresh برای موبایل در حالت PWA.
 * فقط وقتی scrollTop === 0 و کاربر به پایین می‌کشد فعال می‌شود.
 */
export function PullToRefresh({ children, className }: PullToRefreshProps) {
  const isStandalone = usePwaStandalone();
  const router = useRouter();
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // فقط از بالای صفحه شروع می‌شود
    if (document.documentElement.scrollTop > 0) return;
    touchStartY.current = e.touches[0]!.clientY;
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (touchStartY.current === null || isRefreshing) return;
      const delta = e.touches[0]!.clientY - touchStartY.current;
      if (delta <= 0) {
        touchStartY.current = null;
        setPullY(0);
        return;
      }
      // مقاومت ربع‌دایره‌ای برای احساس طبیعی
      const clamped = Math.min(delta * 0.5, MAX_PULL);
      setPullY(clamped);
      if (delta > 10) e.preventDefault();
    },
    [isRefreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (touchStartY.current === null) return;
    touchStartY.current = null;

    if (pullY >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullY(THRESHOLD);
      router.refresh();
      // کمی صبر می‌کنیم تا انیمیشن دیده شود
      await new Promise((r) => setTimeout(r, 800));
      setIsRefreshing(false);
      setPullY(0);
    } else {
      setPullY(0);
    }
  }, [pullY, isRefreshing, router]);

  useEffect(() => {
    if (!isStandalone) return;
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isStandalone, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const showIndicator = pullY > 0 || isRefreshing;
  const isReady = pullY >= THRESHOLD;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* نشانگر pull-to-refresh — فقط موبایل در PWA */}
      {isStandalone && (
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-center overflow-hidden transition-[height]',
            showIndicator ? 'duration-0' : 'duration-300'
          )}
          style={{ height: showIndicator ? pullY : 0 }}
        >
          <div
            className={cn(
              'mt-2 flex size-9 items-center justify-center rounded-full border border-kv-border bg-kv-surface shadow-kv-raised transition-colors',
              isReady ? 'text-kv-brand' : 'text-kv-text-muted'
            )}
          >
            <FaIcon
              icon={faIcons.arrowsRotate}
              size="sm"
              className={cn(
                'transition-transform duration-300',
                isRefreshing && 'animate-spin',
                isReady && !isRefreshing && 'rotate-180'
              )}
            />
          </div>
        </div>
      )}

      <div
        style={{
          transform: isStandalone && pullY > 0 ? `translateY(${pullY}px)` : undefined,
          transition: pullY === 0 ? 'transform 0.3s ease' : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
