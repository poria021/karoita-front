import type { ButtonHTMLAttributes, ReactNode } from 'react';

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
  type = 'submit',
  disabled,
  ...rest
}: AuthSubmitButtonProps) {
  return (
    <KvButton
      {...rest}
      type={type}
      color="cta"
      appearance="solid"
      fullWidth
      loading={isLoading}
      disabled={disabled || isLoading}
    >
      {isLoading ? loadingLabel : children}
    </KvButton>
  );
}
