import { KvTypography } from '@/components/shared/KvTypography';

/**
 * Persistent footer inside the authenticated main viewport.
 * Mirrors the copyright + version strip from `original-karvita.html`.
 */
export function DashboardFooter() {
  return (
    <footer className="mt-kv-10 flex flex-col items-center justify-between gap-kv-inline border-t border-slate-100 pt-kv-stack sm:flex-row">
      <KvTypography variant="overline" tone="muted" as="p">
        تمام حقوق مادی و معنوی متعلق به سامانه آموزشی مهارتی کارویتا می‌باشد.
      </KvTypography>
      <div className="flex items-center gap-kv-2">
        <KvTypography variant="overline" tone="muted" as="span">
          v3.4.0
        </KvTypography>
      </div>
    </footer>
  );
}
