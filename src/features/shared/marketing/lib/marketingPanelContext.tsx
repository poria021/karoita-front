'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { kvScrollAreaClassName } from '@/components/shared/KvScrollArea';

export type MarketingPanelId =
  | 'benefits'
  | 'about'
  | 'internship'
  | 'advantages';

/** Auto-hide open nav panels after this idle window (no interaction on the panel). */
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
    // Wait a tick so the target panel is un-hidden before scrolling.
    const timer = window.setTimeout(() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingScrollId(null);
    }, 40);

    return () => window.clearTimeout(timer);
  }, [pendingScrollId, activePanel]);

  return (
    <MarketingPanelContext.Provider
      value={{ activePanel, openPanel, bumpPanelActivity }}
    >
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
 * Always mounts panel copy for SSR/crawlers; visually shows only the active nav target
 * at viewport height. Inactive panels use `hidden` (out of layout, still in HTML).
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
      hidden={!isOpen}
      // Prevent tabbing into closed panels while keeping markup crawlable.
      inert={!isOpen ? true : undefined}
      className={
        isOpen
          ? `kv-auth-enter flex min-h-dvh w-full scroll-mt-0 items-center justify-center overflow-y-auto border-t border-kv-border-muted ${kvScrollAreaClassName}`
          : undefined
      }
    >
      <div className="w-full py-20 lg:py-24">{children}</div>
    </section>
  );
}
