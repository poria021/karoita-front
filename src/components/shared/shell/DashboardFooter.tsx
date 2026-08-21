import { KvTypography } from '@/components/shared/KvTypography';
import { kvProductFooterBorderClassName } from '@/components/shared/shell/shellChrome';
import { cn } from '@/lib/utils';

export function DashboardFooter() {
  return (
    <footer
      className={cn(
        'mt-kv-region flex flex-col items-center justify-between gap-kv-inline pt-kv-stack sm:flex-row',
        kvProductFooterBorderClassName
      )}
    >
      {/* tone left at default (faint) — "disabled" is for inactive controls,
          not permanently-visible copy; it fails WCAG AA contrast here. */}
      <KvTypography variant="overline" as="p">
        تمام حقوق مادی و معنوی متعلق به سامانه آموزشی مهارتی کارویتا می‌باشد.
      </KvTypography>
      <div className="flex items-center gap-kv-pair">
        <KvTypography variant="overline" as="span">
          v3.4.0
        </KvTypography>
      </div>
    </footer>
  );
}
