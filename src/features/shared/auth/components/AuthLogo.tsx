import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KvTypography } from '@/components/shared/KvTypography';

interface AuthLogoProps {
  subtitle: string;
}

export function AuthLogo({ subtitle }: AuthLogoProps) {
  return (
    <div className="mb-kv-section mt-kv-inset flex flex-col items-center text-center ">
      <div className="flex items-center gap-2 text-3xl sm:text-4xl">
        <KarvitaBrandMark className="!h-[1.15em] !w-auto" />
        <KvTypography
          variant="display"
          weight="black"
          as="span"
          className="text-kv-brand"
        >
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
