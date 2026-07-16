/**
 * Persistent footer inside the authenticated main viewport.
 * Mirrors the copyright + version strip from `original-karvita.html`.
 */
export function DashboardFooter() {
  return (
    <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-5 text-[10px] font-bold text-slate-400 sm:flex-row">
      <p>تمام حقوق مادی و معنوی متعلق به سامانه آموزشی مهارتی کارویتا می‌باشد.</p>
      <div className="flex items-center gap-2 text-[9px]">
        <span className="transition-colors hover:text-brand-500" aria-label="نسخه سامانه">
          v3.4.0
        </span>
      </div>
    </footer>
  );
}
