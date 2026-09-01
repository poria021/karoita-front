'use client';

import { useState, type FormEvent, type FormEventHandler, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface AuthBusyFormProps {
  busy?: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  autoComplete?: string;
}

/**
 * فیلدها را با کلیک submit قفل می‌کند تا promise تمام شود (پاسخ سرور یا شکست اعتبارسنجی).
 */
export function AuthBusyForm({
  busy = false,
  onSubmit,
  children,
  autoComplete,
}: AuthBusyFormProps) {
  const [inFlight, setInFlight] = useState(false);
  const locked = busy || inFlight;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setInFlight(true);
    try {
      await Promise.resolve(onSubmit(event));
    } finally {
      setInFlight(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-kv-section"
      noValidate
      autoComplete={autoComplete}
      aria-busy={locked || undefined}
    >
      <fieldset
        disabled={locked}
        className={cn(
          'm-0 flex min-w-0 flex-col gap-kv-section border-0 p-0',
          locked &&
            'pointer-events-none [&_input]:cursor-not-allowed [&_input]:bg-kv-field-disabled [&_input]:text-kv-text-disabled'
        )}
      >
        {children}
      </fieldset>
    </form>
  );
}
