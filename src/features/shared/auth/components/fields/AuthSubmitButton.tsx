import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AuthSubmitButtonProps {
  isReady: boolean;
  isLoading: boolean;
  loadingLabel: string;
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Full-width CTA button matching `.btn-kv` / `.btn-kv-cta` / `.btn-kv-primary`
 * from the mockup: a solid brand-gradient once the form step is valid, a
 * muted brand fill otherwise.
 */
export function AuthSubmitButton({ isReady, isLoading, loadingLabel, icon, children }: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={!isReady || isLoading}
      className={cn(
        'h-auto w-full gap-2 rounded-xl py-3 text-xs font-black transition-all duration-200',
        isReady
          ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/20 hover:opacity-95'
          : 'bg-brand-500 text-white'
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          {icon}
          <span>{children}</span>
        </>
      )}
    </Button>
  );
}
