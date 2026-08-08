import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KvTypography } from '@/components/shared/KvTypography';

interface AuthLogoProps {
  subtitle: string;
}

export function AuthLogo({ subtitle }: AuthLogoProps) {
  return (
    <div className="mb-kv-section mt-kv-inset flex flex-col items-center text-center ">
      <div className="flex items-center gap-kv-inline">
        <KarvitaBrandMark />
        <KvTypography variant="display" tone="brand" weight="black" as="span">
          کارویتا
        </KvTypography>
      </div>
      <div className=" max-w-[22rem]">
        <KvTypography variant="overline" tone="muted" align="center">
          {subtitle}
        </KvTypography>
      </div>
    </div>
  );
}
