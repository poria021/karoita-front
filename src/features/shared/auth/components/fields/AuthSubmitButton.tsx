import type { ReactNode } from 'react';

import { KvButton } from '@/components/shared/KvButton';

interface AuthSubmitButtonProps {
  isLoading: boolean;
  loadingLabel: string;
  children: ReactNode;
}

/**
 * Full-width CTA for auth forms — text only (no icons).
 * Stays clickable until submit; only disables while a request is in flight.
 */
export function AuthSubmitButton({
  isLoading,
  loadingLabel,
  children,
}: AuthSubmitButtonProps) {
  return (
    <KvButton
      type="submit"
      color="cta"
      appearance="solid"
      fullWidth
      loading={isLoading}
    >
      {isLoading ? loadingLabel : children}
    </KvButton>
  );
}
