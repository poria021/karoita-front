'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useForgotPassword } from '../hooks/useForgotPassword';
import { loginHref } from '../lib/authHrefs';
import {
  consumeAuthFlowMobilePrefill,
  writeAuthFlowMobilePrefill,
} from '../utils/authFlowMobilePrefill';
import { ForgotRequestStep } from './ForgotRequestStep';
import { ForgotResetStep } from './ForgotResetStep';

interface ForgotFormProps {
  returnUrl?: string | null;
}

export function ForgotForm({ returnUrl = null }: ForgotFormProps) {
  const router = useRouter();
  const backToLogin = loginHref({ returnUrl });

  const [prefill] = useState(() => consumeAuthFlowMobilePrefill());

  const onComplete = useCallback(
    (recoveredMobile: string) => {
      writeAuthFlowMobilePrefill(recoveredMobile);
      router.replace(backToLogin);
    },
    [backToLogin, router]
  );

  const forgot = useForgotPassword({ onComplete });
  const { start } = forgot;

  useEffect(() => {
    if (prefill) start(prefill);
  }, [prefill, start]);

  return (
    <div className="flex flex-col gap-kv-group">
      {forgot.forgotStep === 1 && (
        <ForgotRequestStep forgot={forgot} cancelHref={backToLogin} />
      )}
      {forgot.forgotStep === 2 && <ForgotResetStep forgot={forgot} />}
    </div>
  );
}
