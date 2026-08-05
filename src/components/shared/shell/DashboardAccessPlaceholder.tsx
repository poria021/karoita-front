/**
 * Plain canvas while session/role gates resolve a redirect.
 * Not a data skeleton — no pulse bones (rule 84).
 */
export function DashboardAccessPlaceholder({
  fullViewport = false,
}: {
  /** Use for shell-level auth/hydration gates that replace Header+Sidebar. */
  fullViewport?: boolean;
} = {}) {
  return (
    <div
      className={
        fullViewport
          ? 'min-h-dvh w-full bg-kv-canvas'
          : 'min-h-40 w-full bg-kv-canvas'
      }
      aria-busy="true"
      aria-live="polite"
    />
  );
}
