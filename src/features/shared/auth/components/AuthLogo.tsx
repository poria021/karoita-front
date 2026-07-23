import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KvTypography } from '@/components/shared/KvTypography';

interface AuthLogoProps {
  subtitle: string;
}

export function AuthLogo({ subtitle }: AuthLogoProps) {
  return (
    <div className="mb-kv-section flex flex-col items-center text-center">
      <div className="flex items-center gap-kv-inline">
        <KarvitaBrandMark />
        <KvTypography variant="display" tone="brand" as="span">
          کارویتا
        </KvTypography>
      </div>
      <div className="mt-kv-stack max-w-[22rem]">
        <KvTypography variant="caption" tone="muted" align="center">
          {subtitle}
        </KvTypography>
      </div>
    </div>
  );
}
