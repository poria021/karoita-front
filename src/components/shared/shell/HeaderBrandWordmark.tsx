/**
 * Header brand wordmark + quiet subtitle, end-aligned (RTL).
 */
export function HeaderBrandWordmark() {
  return (
    <div className="flex min-w-0 flex-col items-start justify-center gap-1.5">
      <h1 className="leading-none">
        <span
          className="kv-brand-wordmark block h-5 w-32 shrink-0 text-kv-text-secondary sm:h-6 sm:w-36"
          role="img"
          aria-label="کارویتا"
        />
      </h1>
      <p className="max-w-32 truncate font-sans text-xs font-medium leading-none tracking-wide text-kv-text-muted scale-90 origin-top-right">
        سامانه کارآموزی و کارورزی
      </p>
    </div>
  );
}
