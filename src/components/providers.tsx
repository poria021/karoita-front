"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

/**
 * Single client-side provider boundary for the whole app.
 *
 * Why this needs to be its own file instead of living in the root layout:
 * `QueryClientProvider`/`sonner`'s `Toaster` both rely on React Context and
 * client-only APIs, which forces this component (and everything inside it)
 * to opt into the client runtime via `"use client"`. By isolating that
 * boundary here, `src/app/layout.tsx` stays a Server Component - it can
 * still do server-only work (metadata, fonts, `<html>`/`<body>` shell)
 * without shipping its own JS to the browser. Only the subtree that
 * genuinely needs interactivity/context (i.e. everything rendered through
 * `<Providers>`) is compiled into the client bundle.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Instantiated once via `useState` (not a top-level `const`) so every
  // request/browser tab gets its own `QueryClient` instance - sharing one
  // across requests on the server would leak cached data between users,
  // and recreating it on every render would drop the cache entirely.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Avoid refetch storms on window focus for a fairly static admin/
            // dashboard app; individual queries can still opt back in.
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="bottom-left" richColors />
    </QueryClientProvider>
  );
}
