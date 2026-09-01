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
      {/* `tone` پیش‌فرض (`faint`) بماند — `disabled` برای کنترل غیرفعال است و اینجا کنتراست WCAG AA را رد می‌کند. */}
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
