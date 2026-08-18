'use client';

import { KvTypography } from '@/components/shared/KvTypography';
import {
  kvProductFooterBorderClassName,
} from '@/components/shared/shell/shellChrome';
import { cn } from '@/lib/utils';

import { useAdminGate } from '../hooks/useAdminGate';
import { AdminGateMobileStep } from './AdminGateMobileStep';
import { AdminGateOtpStep } from './AdminGateOtpStep';
import { AuthLogo } from './AuthLogo';

export function AdminGateCard() {
  const gate = useAdminGate();

  return (
    <div className="kv-auth-enter mt-kv-section w-full max-w-[450px] overflow-hidden rounded-kv-card border border-kv-border/80 bg-kv-surface shadow-kv-overlay">
      <div className="p-kv-inset sm:p-kv-page">
        <AuthLogo subtitle="درگاه امن ورود مدیریت ارشد سامانه" />

        <div
          aria-hidden={gate.step !== 1}
          style={{ display: gate.step === 1 ? 'block' : 'none' }}
        >
          <AdminGateMobileStep gate={gate} />
        </div>

        <div aria-hidden={gate.step !== 2} style={{ display: gate.step === 2 ? 'block' : 'none' }}>
          <AdminGateOtpStep gate={gate} />
        </div>

        <div
          className={cn(
            'mt-kv-section pt-kv-stack text-center',
            kvProductFooterBorderClassName
          )}
        >
          <KvTypography variant="overline" tone="disabled" align="center">
            نسخه امنیتی ستاد • دسترسی محدود
          </KvTypography>
        </div>
      </div>
    </div>
  );
}
