interface AuthLogoProps {
  subtitle: string;
}

/**
 * Brand mark + wordmark header shared by every auth card. The mark is a raw
 * inline SVG ported from `original-karvita.html` — not an icon-font glyph —
 * so it stays untouched by the FontAwesome-to-Lucide iconography rule.
 */
export function AuthLogo({ subtitle }: AuthLogoProps) {
  return (
    <div className="mb-6 flex flex-col items-center text-center">
      <div className="flex items-center gap-3">
        <svg className="h-10 w-auto rounded-xl shadow-sm" viewBox="0 0 45 45" fill="none" aria-hidden="true">
          <rect width="45" height="45" rx="12" fill="#0D5EEC" />
          <path
            d="M14 12V33M14 22.5L28 12M20.5 22.5L28.5 33"
            stroke="white"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-3xl font-extrabold tracking-tight text-brand-500">کارویتا</span>
      </div>
      <p className="mt-2.5 text-[11px] font-bold text-slate-400">{subtitle}</p>
    </div>
  );
}
