import { KvAlert } from '@/components/shared/KvAlert';

import type { AuthFormMessageState } from '../../types';

interface AuthFormMessageProps {
  message: AuthFormMessageState | null;
  onDismiss: () => void;
}

const TYPE_TO_VARIANT = {
  error: 'error',
  success: 'success',
  info: 'info',
} as const satisfies Record<
  AuthFormMessageState['type'],
  'error' | 'success' | 'info'
>;

/**
 * Auth form banner — thin wrapper over KvAlert (single alert chrome, rule 75).
 */
export function AuthFormMessage({ message, onDismiss }: AuthFormMessageProps) {
  if (!message) return null;

  return (
    <div className="mb-kv-group w-full">
      <KvAlert
        variant={TYPE_TO_VARIANT[message.type]}
        title={message.text}
        dismissible
        onDismiss={onDismiss}
      />
    </div>
  );
}
