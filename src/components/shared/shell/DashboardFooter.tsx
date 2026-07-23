import { KvTypography } from '@/components/shared/KvTypography';

export function DashboardFooter() {
  return (
    <footer className="mt-kv-region flex flex-col items-center justify-between gap-kv-inline border-t border-kv-border pt-kv-stack sm:flex-row">
      <KvTypography variant="overline" tone="muted" as="p">
        تمام حقوق مادی و معنوی متعلق به سامانه آموزشی مهارتی کارویتا می‌باشد.
      </KvTypography>
      <div className="flex items-center gap-kv-pair">
        <KvTypography variant="overline" tone="muted" as="span">
          v3.4.0
        </KvTypography>
      </div>
    </footer>
  );
}
