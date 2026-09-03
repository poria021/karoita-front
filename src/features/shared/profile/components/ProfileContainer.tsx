'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import {
  AppTabs,
  AppTabsContent,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';
import { kvTabsBodyBorderClassName } from '@/components/shared/shell/shellChrome';
import { useSyncedUrlParam } from '@/hooks/useSyncedUrlParam';
import { cn } from '@/lib/utils';
import { AuthService } from '@/services/auth.service';
import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';
import type { UserRole } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';

import { ProfileStatusAlert } from './alerts/ProfileStatusAlert';
import { IdentityForm } from './forms/IdentityForm';
import { SecurityForm } from './forms/SecurityForm';

type ProfileTab = 'identity' | 'security';

const PROFILE_TABS: readonly ProfileTab[] = ['identity', 'security'];

interface ProfileUiStrategy {
  showSecurityTab: boolean;
  showStatusAlerts: boolean;
  lockIdentityAfterSubmit: boolean;
  showDocUploader: boolean;
  identitySubmitLabel: string;
}

/**
 * پیش‌فرض برای اکثر نقش‌ها یکسان است — فقط چند نقش استثنا دارند
 * (override در `PROFILE_UI_STRATEGY_OVERRIDES`)، به‌جای تکرار همان
 * آبجکت ۵ فیلدی برای هر ۱۱ نقش.
 */
const PROFILE_UI_STRATEGY_DEFAULT: ProfileUiStrategy = {
  showSecurityTab: true,
  showStatusAlerts: true,
  lockIdentityAfterSubmit: true,
  showDocUploader: true,
  identitySubmitLabel: 'ثبت و ارسال نهایی اطلاعات',
};

const PROFILE_UI_STRATEGY_OVERRIDES: Partial<
  Record<UserRole, Partial<ProfileUiStrategy>>
> = {
  faculty_role: { showStatusAlerts: false },
  provincial_university: { showStatusAlerts: false },
  assistant_admin: { showStatusAlerts: false },
  central_organization: { showStatusAlerts: false },
  super_admin: {
    showSecurityTab: false,
    showStatusAlerts: false,
    lockIdentityAfterSubmit: false,
    showDocUploader: false,
    identitySubmitLabel: 'ذخیره تغییرات مشخصات سیستم',
  },
};

function getProfileUiStrategy(role: UserRole): ProfileUiStrategy {
  return {
    ...PROFILE_UI_STRATEGY_DEFAULT,
    ...PROFILE_UI_STRATEGY_OVERRIDES[role],
  };
}

export interface ProfileContainerProps {
  role: UserRole;
}

export function ProfileContainer({ role }: ProfileContainerProps) {
  return <ProfileContainerInner role={role} />;
}

function ProfileContainerInner({ role }: ProfileContainerProps) {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);
  const session = AuthService.getSession();

  // پارامتر `tab` از هوک مشترک dashboard chrome می‌آید —
  // آینهٔ URL سطحی است، نه `router.replace`.
  const [urlTab, setUrlTab] = useSyncedUrlParam<ProfileTab>({
    name: 'tab',
    allowed: PROFILE_TABS,
    defaultValue: 'identity',
  });

  useEffect(() => {
    if (!activeUser) {
      router.replace(RouteService.auth.login());
      return;
    }
    if (activeUser.role !== role) {
      router.replace(RouteService.karvita.profile(activeUser.role));
    }
  }, [activeUser, role, router]);

  if (!activeUser || activeUser.role !== role) {
    return <ProfileRoutePlaceholder />;
  }

  const uiStrategy = getProfileUiStrategy(activeUser.role);
  // اگر نقش کاربر تب امنیت را ندارد ولی URL همچنان ?tab=security دارد،
  // به identity برگرد (این گیت کسب‌وکاری است، نه اعتبارسنجی خود پارامتر).
  const activeTab: ProfileTab =
    urlTab === 'security' && uiStrategy.showSecurityTab
      ? 'security'
      : 'identity';

  const handleTabChange = (value: string) => {
    setUrlTab(value === 'security' ? 'security' : 'identity');
  };

  const statusAlerts = uiStrategy.showStatusAlerts ? (
    <ProfileStatusAlert
      approved={activeUser.approved}
      docStatus={activeUser.docStatus}
      adminRequestMessage={activeUser.adminRequestMessage}
    />
  ) : null;

  const isAwaitingAdminReview =
    uiStrategy.lockIdentityAfterSubmit &&
    activeUser.docStatus === 'pending_admin';
  const identitySubmitLabel =
    uiStrategy.lockIdentityAfterSubmit && activeUser.docStatus === 'approved'
      ? 'ذخیره تغییرات'
      : uiStrategy.identitySubmitLabel;

  const identityForm = (
    <IdentityForm
      activeUser={activeUser}
      token={session?.token}
      disabled={isAwaitingAdminReview}
      statusAlerts={statusAlerts}
      showDocUploader={uiStrategy.showDocUploader}
      submitLabel={identitySubmitLabel}
      autoApproveOnSave={!uiStrategy.lockIdentityAfterSubmit}
    />
  );

  if (!uiStrategy.showSecurityTab) {
    return (
      <div
        dir="rtl"
        className="mx-auto w-full max-w-4xl space-y-kv-section font-sans text-xs"
      >
        {identityForm}
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="mx-auto w-full max-w-4xl space-y-kv-section font-sans"
    >
      <div className="space-y-kv-stack pt-kv-micro">
        <AppTabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="gap-kv-group"
        >
          <AppTabsList>
            <AppTabsTrigger value="identity">
              <FaIcon icon={faIcons.idCard} size="xs" />
              <span>اطلاعات هویتی و مدارک</span>
            </AppTabsTrigger>
            <AppTabsTrigger value="security">
              <FaIcon icon={faIcons.key} size="xs" />
              <span>تنظیم رمز عبور حساب</span>
            </AppTabsTrigger>
          </AppTabsList>

          <AppTabsContent
            value="identity"
            className={cn('mt-0 py-kv-group', kvTabsBodyBorderClassName)}
          >
            {identityForm}
          </AppTabsContent>

          <AppTabsContent
            value="security"
            className={cn('mt-0 py-kv-group', kvTabsBodyBorderClassName)}
          >
            <SecurityForm
              mobile={activeUser.mobile}
              hasPassword={activeUser.hasPassword !== false}
            />
          </AppTabsContent>
        </AppTabs>
      </div>
    </div>
  );
}

export function ProfileRoutePlaceholder() {
  return <DashboardAccessPlaceholder />;
}
