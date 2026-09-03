import { KvTypography } from '@/components/shared/KvTypography';
import type { KvShellRailTextSize } from '@/components/shared/shell/shellChrome';
import { cn } from '@/lib/utils';

export function HeaderBrandWordmark({
  textSize = 'compact',
}: {
  textSize?: KvShellRailTextSize;
}) {
  const legible = textSize === 'legible';

  return (
    <div className="flex min-w-0 flex-col items-start justify-center gap-1.5">
      <KvTypography variant="title" weight="black" as="h1">
        کارویتا
      </KvTypography>
      <KvTypography
        variant={legible ? 'body' : 'overline'}
        tone="muted"
        as="p"
        truncate
        className={cn(legible ? 'max-w-44' : 'max-w-32')}
      >
        سامانه کارآموزی و کارورزی
      </KvTypography>
    </div>
  );
}
