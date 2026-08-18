import type { ReactNode } from 'react';
import type { ButtonHTMLAttributes } from 'react';

import { KvButton } from '@/components/shared/KvButton';

interface AuthSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingLabel: string;
  children: ReactNode;
}

export function AuthSubmitButton({
  isLoading,
  loadingLabel,
  children,
  ...rest
}: AuthSubmitButtonProps) {
  return (
    <KvButton
      type="submit"
      color="cta"
      appearance="solid"
      fullWidth
      loading={isLoading}
      disabled={isLoading}
      {...(rest as Record<string, unknown>)}
    >
      {isLoading ? loadingLabel : children}
    </KvButton>
  );
}
