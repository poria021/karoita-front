'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const PANEL_EXIT_MS = 300;

import { kvScrollAreaClassName } from '@/components/shared/KvScrollArea';

export type MarketingPanelId =
  | 'benefits'
  | 'about'
  | 'internship'
  | 'advantages';

/** پنل ناو باز بعد از این پنجرهٔ بی‌فعالیت خودکار پنهان شود. */
const PANEL_IDLE_MS = 60_000;

type MarketingPanelContextValue = {
  activePanel: MarketingPanelId | null;
  openPanel: (id: MarketingPanelId | null) => void;
  bumpPanelActivity: () => void;
};

const MarketingPanelContext = createContext<MarketingPanelContextValue | null>(
  null,
);

export function MarketingPanelProvider({ children }: { children: ReactNode }) {
  const [activePanel, setActivePanel] = useState<MarketingPanelId | null>(null);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  const idleTimerRef = useRef<number | null>(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current != null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const scheduleIdleClose = useCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = window.setTimeout(() => {
      setActivePanel(null);
      idleTimerRef.current = null;
    }, PANEL_IDLE_MS);
  }, [clearIdleTimer]);

  const openPanel = useCallback(
    (id: MarketingPanelId | null) => {
      setActivePanel(id);
      setPendingScrollId(id ?? 'hero');
      if (id) {
        scheduleIdleClose();
      } else {
        clearIdleTimer();
      }
    },
    [clearIdleTimer, scheduleIdleClose],
  );

  const bumpPanelActivity = useCallback(() => {
    if (!activePanel) return;
    scheduleIdleClose();
  }, [activePanel, scheduleIdleClose]);

  useEffect(() => {
    return () => clearIdleTimer();
  }, [clearIdleTimer]);

  useEffect(() => {
    if (!pendingScrollId) return;

    const targetId = pendingScrollId;
    // یک تیک صبر کن تا پنل هدف از `hidden` درآید، بعد اسکرول.
    const timer = window.setTimeout(() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingScrollId(null);
    }, 40);

    return () => window.clearTimeout(timer);
  }, [pendingScrollId, activePanel]);

  const value = useMemo(
    () => ({ activePanel, openPanel, bumpPanelActivity }),
    [activePanel, openPanel, bumpPanelActivity]
  );

  return (
    <MarketingPanelContext.Provider value={value}>
      {children}
    </MarketingPanelContext.Provider>
  );
}

export function useMarketingPanel() {
  const ctx = useContext(MarketingPanelContext);
  if (!ctx) {
    throw new Error('useMarketingPanel must be used within MarketingPanelProvider');
  }
  return ctx;
}

/**
 * رونوشت پنل همیشه برای SSR/خزنده‌ها mount می‌شود؛ فقط هدف ناو فعال در ارتفاع viewport دیده می‌شود.
 * پنل غیرفعال `hidden` است (خارج از لایوت، هنوز در HTML).
 */
export function MarketingPanel({
  id,
  children,
}: {
  id: MarketingPanelId;
  children: ReactNode;
}) {
  const { activePanel, bumpPanelActivity } = useMarketingPanel();
  const panelRef = useRef<HTMLElement>(null);
  const isOpen = activePanel === id;
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<number | null>(null);
  // `mounted` هیچ‌وقت state جدا نیست: تا زمانی که پنل باز است یا در حال
  // انیمیشن خروج، باید mount بماند؛ در غیر این صورت باید بلافاصله حذف شود.
  const mounted = isOpen || isExiting;

  useEffect(() => {
    // هماهنگ‌سازی state محلی انیمیشن با prop خارجی (`isOpen`) و تایمر CSS
    // transition؛ این مقدار نمی‌تواند در زمان رندر مشتق شود چون باید بین چند
    // رندر (طول عمر انیمیشن خروج) پایدار بماند.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (isOpen) {
      // بازشدن دوباره (حتی وسط انیمیشن خروج) → لغو تایمر خروج و بازگشت فوری.
      if (exitTimerRef.current != null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      setIsExiting(false);
      return;
    }
    if (activePanel !== null) {
      // جابه‌جایی مستقیم به پنل دیگر → پنهان‌شدن فوری بدون انیمیشن خروج.
      setIsExiting(false);
      return;
    }
    // بسته‌شدن کامل (بدون پنل جایگزین) → پخش انیمیشن خروج، سپس unmount.
    setIsExiting(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    exitTimerRef.current = window.setTimeout(() => {
      setIsExiting(false);
      exitTimerRef.current = null;
    }, PANEL_EXIT_MS);
    return () => {
      if (exitTimerRef.current != null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [isOpen, activePanel]);

  useEffect(() => {
    if (!isOpen) return;
    const el = panelRef.current;
    if (!el) return;

    const onActivity = () => bumpPanelActivity();
    const events: Array<keyof HTMLElementEventMap> = [
      'pointerdown',
      'pointermove',
      'wheel',
      'keydown',
      'focusin',
      'scroll',
    ];

    for (const eventName of events) {
      el.addEventListener(eventName, onActivity, { passive: true });
    }

    return () => {
      for (const eventName of events) {
        el.removeEventListener(eventName, onActivity);
      }
    };
  }, [bumpPanelActivity, isOpen]);

  return (
    <section
      ref={panelRef}
      id={id}
      hidden={!mounted}
      // تب به پنل بسته نرود؛ markup برای خزنده‌ها بماند.
      inert={!isOpen ? true : undefined}
      className={
        mounted
          ? `${isExiting ? 'kv-panel-exit' : 'kv-auth-enter'} flex min-h-dvh w-full scroll-mt-0 items-center justify-center overflow-y-auto border-t border-kv-border-muted ${kvScrollAreaClassName}`
          : undefined
      }
    >
      <div className="w-full py-20 lg:py-24">{children}</div>
    </section>
  );
}
