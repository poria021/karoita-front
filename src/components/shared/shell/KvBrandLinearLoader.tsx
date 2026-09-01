import { cn } from '@/lib/utils';
import { KvTypography } from '@/components/shared/KvTypography';

interface KvBrandLinearLoaderProps {
  /**
   * Full-viewport overlay — use for the two auth-boundary transitions
   * (entering the dashboard after login, exiting it on logout).
   */
  fullViewport?: boolean;
  /** Optional quiet caption under the mark (e.g. "در حال ورود…"). */
  label?: string;
  className?: string;
}

/**
 * Brand mark + indeterminate linear progress — auth-boundary transition
 * screen ONLY (login → dashboard, logout → marketing, cold dashboard boot).
 *
 * Not for ordinary dashboard SPA loading: internal navigation between
 * modules and tabs must keep the previous page until the next one paints
 * (no `loading.tsx`, no full-page takeover). Data busy still follows
 * `KvTableBusy` / `KvBusySurface`.
 *
 * Full-viewport uses the public marketing canvas (`kv-brand-atmosphere` +
 * `kv-blueprint-bg`) so login/logout match landing and auth. Dashboard
 * chrome itself stays a quiet canvas.
 */
export function KvBrandLinearLoader({
  fullViewport = false,
  label,
  className,
}: KvBrandLinearLoaderProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-kv-section',
        fullViewport
          ? 'kv-brand-atmosphere kv-blueprint-bg min-h-dvh'
          : 'min-h-40 bg-kv-canvas',
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span aria-hidden="true" className="kv-brand-mark size-10 text-kv-brand sm:size-12" />

      <div className="flex w-40 flex-col items-center gap-kv-field sm:w-48">
        <div className="kv-linear-indeterminate h-1 w-full overflow-hidden rounded-full bg-kv-brand-soft" />
        {label ? (
          <KvTypography variant="overline" tone="muted" align="center">
            {label}
          </KvTypography>
        ) : null}
      </div>

      <span className="sr-only">در حال بارگذاری…</span>
    </div>
  );
}
