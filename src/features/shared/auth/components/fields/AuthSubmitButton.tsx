import type { ReactNode } from 'react';

import { KvButton } from '@/components/shared/KvButton';

interface AuthSubmitButtonProps {
  isLoading: boolean;
  loadingLabel: string;
  children: ReactNode;
}

/**
 * Full-width CTA for auth forms — text only (no icons).
 * `loading` disables the control (anti double-submit, rule 45).
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
      disabled={isLoading}
    >
      {isLoading ? loadingLabel : children}
    </KvButton>
  );
}
