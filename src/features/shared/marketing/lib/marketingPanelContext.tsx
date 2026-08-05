'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type MarketingPanelId =
  | 'benefits'
  | 'about'
  | 'internship'
  | 'advantages';

type MarketingPanelContextValue = {
  activePanel: MarketingPanelId | null;
  openPanel: (id: MarketingPanelId | null) => void;
};

const MarketingPanelContext = createContext<MarketingPanelContextValue | null>(
  null,
);

export function MarketingPanelProvider({ children }: { children: ReactNode }) {
  const [activePanel, setActivePanel] = useState<MarketingPanelId | null>(null);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

  const openPanel = useCallback((id: MarketingPanelId | null) => {
    setActivePanel(id);
    setPendingScrollId(id ?? 'hero');
  }, []);

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
    <MarketingPanelContext.Provider value={{ activePanel, openPanel }}>
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
  const { activePanel } = useMarketingPanel();

  if (activePanel !== id) return null;

  return (
    <div
      id={id}
      className="kv-auth-enter flex min-h-dvh w-full scroll-mt-0 items-center justify-center overflow-y-auto border-t border-kv-border-muted"
    >
      <div className="w-full py-20 lg:py-24">{children}</div>
    </div>
  );
}
