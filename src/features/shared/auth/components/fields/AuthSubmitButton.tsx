import type { ReactNode } from 'react';

import { KvButton } from '@/components/shared/KvButton';

interface AuthSubmitButtonProps {
  isLoading: boolean;
  loadingLabel: string;
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Full-width CTA button matching login primary actions.
 * Stays clickable until submit; only disables while a request is in flight.
 * Validation errors surface via RHF `handleSubmit` + field UI.
 */
export function AuthSubmitButton({
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
      loading={isLoading}
      icon={icon}
      iconPosition="start"
    >
      {isLoading ? loadingLabel : children}
    </KvButton>
  );
}
