'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { RETURN_URL_PARAM } from '@/lib/return-url';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { loginHref } from '../lib/authHrefs';
import {
  consumeAuthFlowMobilePrefill,
  writeAuthFlowMobilePrefill,
} from '../utils/authFlowMobilePrefill';
import { ForgotRequestStep } from './ForgotRequestStep';
import { ForgotResetStep } from './ForgotResetStep';
import { ForgotVerifyStep } from './ForgotVerifyStep';

export function ForgotForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backToLogin = loginHref({
    returnUrl: searchParams.get(RETURN_URL_PARAM),
  });

  const [prefill] = useState(() => consumeAuthFlowMobilePrefill());

  const forgot = useForgotPassword({
    onComplete: (recoveredMobile) => {
      writeAuthFlowMobilePrefill(recoveredMobile);
      router.replace(backToLogin);
    },
  });

  useEffect(() => {
    if (prefill) forgot.start(prefill);
  }, [forgot.start, prefill]);

  return (
    <div className="flex flex-col gap-kv-group">
      {forgot.forgotStep === 1 && (
        <ForgotRequestStep forgot={forgot} cancelHref={backToLogin} />
      )}
      {forgot.forgotStep === 2 && <ForgotVerifyStep forgot={forgot} />}
      {forgot.forgotStep === 3 && <ForgotResetStep forgot={forgot} />}
    </div>
  );
}
