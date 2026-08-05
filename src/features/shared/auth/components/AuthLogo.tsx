import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KarvitaWordmarkText } from '@/components/shared/KarvitaWordmarkText';
import { KvTypography } from '@/components/shared/KvTypography';

interface AuthLogoProps {
  subtitle: string;
}

export function AuthLogo({ subtitle }: AuthLogoProps) {
  return (
    <div className="mb-kv-section flex flex-col items-center text-center">
      <div className="flex items-center gap-kv-inline">
        <KarvitaBrandMark />
        <KarvitaWordmarkText className="w-40 text-kv-brand-soft-fg sm:w-48" />
      </div>
      <div className="mt-kv-stack max-w-[22rem]">
        <KvTypography variant="caption" tone="muted" align="center">
          {subtitle}
        </KvTypography>
      </div>
    </div>
  );
}
