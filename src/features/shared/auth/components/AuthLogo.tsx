import { KvTypography } from '@/components/shared/KvTypography';

interface AuthLogoProps {
  subtitle: string;
}

export function AuthLogo({ subtitle }: AuthLogoProps) {
  return (
    <div className="mb-kv-section flex flex-col items-center text-center">
      <div className="flex items-center gap-kv-inline">
        <svg
          className="h-11 w-auto rounded-kv-control shadow-kv-raised sm:h-12"
          viewBox="0 0 45 45"
          fill="none"
          aria-hidden="true"
        >
          <rect width="45" height="45" rx="12" className="fill-kv-brand" />
          <path
            d="M14 12V33M14 22.5L28 12M20.5 22.5L28.5 33"
            className="stroke-kv-text-inverse"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
