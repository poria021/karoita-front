'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type PageRefreshHandler = () => Promise<unknown> | void;

type PageRefreshRegistry = {
  register: (handler: PageRefreshHandler | null) => void;
  getHandler: () => PageRefreshHandler | null;
};

const PageRefreshContext = createContext<PageRefreshRegistry | null>(null);

function createPageRefreshRegistry(): PageRefreshRegistry {
  let handler: PageRefreshHandler | null = null;
  return {
    register: (next) => {
      handler = next;
    },
    getHandler: () => handler,
  };
}

export function PageRefreshProvider({ children }: { children: ReactNode }) {
  // lazy init با useState (نه useRef) چون خواندن .current یک ref حین render
  // مجاز نیست — این آبجکت فقط یک‌بار ساخته می‌شود و هویتش هرگز عوض نمی‌شود.
  const [registry] = useState(createPageRefreshRegistry);

  return (
    <PageRefreshContext.Provider value={registry}>
      {children}
    </PageRefreshContext.Provider>
  );
}

/**
 * هر صفحه با این هوک، رفرش scoped خودش (مثلاً list.reload) را به دکمهٔ
 * سراسری رفرش معرفی می‌کند — جایگزین invalidateQueries() بدون فیلتر که
 * کل کش React Query (حتی کوئری‌های صفحات دیگر) را دوباره fetch می‌کرد.
 * موقع unmount شدن صفحه (تغییر مسیر)، ثبت به‌طور خودکار پاک می‌شود.
 */
export function useRegisterPageRefresh(handler: PageRefreshHandler) {
  const registry = useContext(PageRefreshContext);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!registry) return;
    registry.register(() => handlerRef.current());
    return () => registry.register(null);
  }, [registry]);
}

/**
 * گرفتنِ تابعِ خواندنِ رفرش ثبت‌شدهٔ صفحهٔ جاری — عمداً یک getter برمی‌گرداند
 * نه مقدار لحظهٔ render، چون ثبت صفحه در effect (بعد از mount) اتفاق می‌افتد
 * و این کامپوننت (دکمه) با آن رجیستر هم‌زمان re-render نمی‌شود؛ پس باید در
 * لحظهٔ کلیک، نه در لحظهٔ render، خوانده شود.
 */
export function usePageRefreshHandlerGetter(): () => PageRefreshHandler | null {
  const registry = useContext(PageRefreshContext);
  return () => (registry ? registry.getHandler() : null);
}
