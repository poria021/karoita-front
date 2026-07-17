'use client';

import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';

import { KvTextField } from '@/components/shared/KvTextField';
import { KvButton } from '@/components/shared/KvButton';

interface PasswordFieldProps {
  id: string;
  label: string;
  registration: UseFormRegisterReturn<string>;
  errorMessage?: string;
}

/** Password input with a Lucide eye/eye-off visibility toggle. */
export function PasswordField({
  id,
  label,
  registration,
  errorMessage,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <KvTextField
        id={id}
        label={label}
        required
        type={isVisible ? 'text' : 'password'}
        size="sm"
        dir="ltr"
        autoComplete="current-password"
        placeholder="********"
        name={registration.name}
        onBlur={registration.onBlur}
        onChange={registration.onChange}
        ref={registration.ref}
        error={errorMessage}
        endAddon={
          <KvButton
            type="button"
            color="neutral"
            appearance="text"
            icon={
              isVisible ? (
                <EyeOff className="size-3.5" aria-hidden="true" />
              ) : (
                <Eye className="size-3.5" aria-hidden="true" />
              )
            }
            onClick={() => setIsVisible((current) => !current)}
            aria-label={isVisible ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
            aria-pressed={isVisible}
            className="me-2"
          />
        }
      />
    </div>
  );
}
