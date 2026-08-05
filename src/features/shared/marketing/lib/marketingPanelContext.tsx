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

export type MarketingPanelId =
  | 'benefits'
  | 'about'
  | 'internship'
  | 'advantages';

/** Auto-hide open nav panels after this idle window (no interaction on the panel). */
const PANEL_IDLE_MS = 20_000;

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
    // Wait a tick so the newly opened panel is in the DOM before scrolling.
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

/** Renders children only when this panel is the active nav target. */
export function MarketingPanel({
  id,
  children,
}: {
  id: MarketingPanelId;
  children: ReactNode;
}) {
  const { activePanel, bumpPanelActivity } = useMarketingPanel();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activePanel !== id) return;
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
  }, [activePanel, bumpPanelActivity, id]);

  if (activePanel !== id) return null;

  return (
    <div
      ref={panelRef}
      id={id}
      className="kv-auth-enter flex min-h-dvh w-full scroll-mt-0 items-center justify-center overflow-y-auto border-t border-kv-border-muted"
    >
      <div className="w-full py-20 lg:py-24">{children}</div>
    </div>
  );
}
