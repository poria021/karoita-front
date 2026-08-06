import { KvTypography } from '@/components/shared/KvTypography';

/**
 * Header brand name + quiet subtitle, start-aligned (RTL).
 */
export function HeaderBrandWordmark() {
  return (
    <div className="flex min-w-0 flex-col items-start justify-center gap-1.5">
      <KvTypography variant="title" weight="black" as="h1">
        کارویتا
      </KvTypography>
      <p className="max-w-32 truncate font-sans text-xs font-medium leading-none tracking-wide text-kv-text-muted scale-90 origin-top-right">
        سامانه کارآموزی و کارورزی
      </p>
    </div>
  );
}
