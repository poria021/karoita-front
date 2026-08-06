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
  null
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
    const timer = window.setTimeout(() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingScrollId(null);
    }, 40);

    return () => window.clearTimeout(timer);
  }, [pendingScrollId]);

  return (
    <MarketingPanelContext.Provider value={{ activePanel, openPanel }}>
      {children}
    </MarketingPanelContext.Provider>
  );
}

export function useMarketingPanel() {
  const ctx = useContext(MarketingPanelContext);
  if (!ctx) {
    throw new Error('useMarketingPanel must be within MarketingPanelProvider');
  }
  return ctx;
}

/**
 * Always-mounted marketing section (crawlable). Nav highlight via context.
 */
export function MarketingPanel({
  id,
  children,
}: {
  id: MarketingPanelId;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="kv-auth-enter w-full scroll-mt-14 border-t border-kv-border-muted lg:scroll-mt-16"
    >
      <div className="w-full py-20 lg:py-24">{children}</div>
    </section>
  );
}
