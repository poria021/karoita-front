import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { AuthFormMessageState } from '../../types';

interface AuthFormMessageProps {
  message: AuthFormMessageState | null;
  onDismiss: () => void;
}

const MESSAGE_STYLES: Record<
  AuthFormMessageState['type'],
  { container: string; icon: string; Icon: typeof CircleAlert }
> = {
  error: { container: 'border-rose-100 bg-rose-50/60 text-rose-700', icon: 'text-rose-500', Icon: CircleAlert },
  success: { container: 'border-emerald-100 bg-emerald-50/60 text-emerald-700', icon: 'text-emerald-500', Icon: CircleCheck },
  info: { container: 'border-blue-100 bg-blue-50/60 text-blue-700', icon: 'text-blue-500', Icon: Info },
};

/** Dismissible feedback banner shown above the auth forms. */
export function AuthFormMessage({ message, onDismiss }: AuthFormMessageProps) {
  if (!message) return null;

  const { container, icon, Icon } = MESSAGE_STYLES[message.type];

  return (
    <div className={cn('mb-kv-group flex w-full items-start gap-kv-inline rounded-xl border p-kv-3 text-start transition-all', container)}>
      <Icon className={cn('mt-0.5 size-4 shrink-0', icon)} aria-hidden="true" />
      <p className="flex-1 text-xs font-semibold">{message.text}</p>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onDismiss}
        aria-label="بستن پیام"
        className="shrink-0 text-slate-400 hover:bg-transparent hover:text-slate-600"
      >
        <X className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
