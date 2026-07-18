'use client';

import { KvTypography } from '@/components/shared/KvTypography';

import { useAdminGate } from '../hooks/useAdminGate';
import { AdminGateMobileStep } from './AdminGateMobileStep';
import { AdminGateOtpStep } from './AdminGateOtpStep';
import { AuthLogo } from './AuthLogo';

/**
 * Standalone super-admin OTP card — no register tab (original-karvita.html).
 */
export function AdminGateCard() {
  const gate = useAdminGate();

  return (
    <div className="kv-auth-enter mt-kv-section w-full max-w-[450px] overflow-hidden rounded-kv-card border border-kv-border/80 bg-kv-surface shadow-kv-overlay">
      <div className="p-kv-inset sm:p-kv-page">
        <AuthLogo subtitle="درگاه امن ورود مدیریت ارشد سامانه" />

        {gate.step === 1 ? (
          <AdminGateMobileStep gate={gate} />
        ) : (
          <AdminGateOtpStep gate={gate} />
        )}

        <div className="mt-kv-section border-t border-kv-border-muted/80 pt-kv-stack text-center">
          <KvTypography variant="overline" tone="muted" align="center">
            نسخه امنیتی ستاد • دسترسی محدود
          </KvTypography>
        </div>
      </div>
    </div>
  );
}
