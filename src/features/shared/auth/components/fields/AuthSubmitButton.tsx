import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

import { KvButton } from '@/components/shared/KvButton';

interface AuthSubmitButtonProps {
  isReady: boolean;
  isLoading: boolean;
  loadingLabel: string;
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Full-width CTA button matching login primary actions.
 * Built on `KvButton` (`color="cta"`).
 */
export function AuthSubmitButton({
  isReady,
  isLoading,
  loadingLabel,
  icon,
  children,
}: AuthSubmitButtonProps) {
  return (
    <KvButton
      type="submit"
      color="cta"
      appearance="solid"
      size="lg"
      fullWidth
      disabled={!isReady || isLoading}
      icon={isLoading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : icon}
      iconPosition="start"
    >
      {isLoading ? loadingLabel : children}
    </KvButton>
  );
}
