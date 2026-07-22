'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import {
  AppTabs,
  AppTabsContent,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import { AuthService } from '@/services/auth.service';
import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';
import type { UserRole } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';

import { ProfileStatusAlert } from './alerts/ProfileStatusAlert';
import { IdentityForm } from './forms/IdentityForm';
import { SecurityForm } from './forms/SecurityForm';

type ProfileTab = 'identity' | 'security';

interface ProfileUiStrategy {
  showSecurityTab: boolean;
  showStatusAlerts: boolean;
  lockIdentityAfterSubmit: boolean;
  showDocUploader: boolean;
  identitySubmitLabel: string;
}

const PROFILE_UI_STRATEGY: Record<UserRole, ProfileUiStrategy> = {
  student: {
    showSecurityTab: true,
    showStatusAlerts: true,
    lockIdentityAfterSubmit: true,
    showDocUploader: true,
    identitySubmitLabel: 'ثبت و ارسال نهایی اطلاعات',
  },
  skill_learner: {
    showSecurityTab: true,
    showStatusAlerts: true,
    lockIdentityAfterSubmit: true,
    showDocUploader: true,
    identitySubmitLabel: 'ثبت و ارسال نهایی اطلاعات',
  },
  supervisor_professor: {
    showSecurityTab: true,
    showStatusAlerts: true,
    lockIdentityAfterSubmit: true,
    showDocUploader: true,
    identitySubmitLabel: 'ثبت و ارسال نهایی اطلاعات',
  },
  mentor_teacher: {
    showSecurityTab: true,
    showStatusAlerts: true,
    lockIdentityAfterSubmit: true,
    showDocUploader: true,
    identitySubmitLabel: 'ثبت و ارسال نهایی اطلاعات',
  },
  school_principal: {
    showSecurityTab: true,
    showStatusAlerts: true,
    lockIdentityAfterSubmit: true,
    showDocUploader: true,
    identitySubmitLabel: 'ثبت و ارسال نهایی اطلاعات',
  },
  regional_edu_admin: {
    showSecurityTab: true,
    showStatusAlerts: true,
    lockIdentityAfterSubmit: true,
    showDocUploader: true,
    identitySubmitLabel: 'ثبت و ارسال نهایی اطلاعات',
  },
  faculty_role: {
    showSecurityTab: true,
    showStatusAlerts: false,
    lockIdentityAfterSubmit: true,
    showDocUploader: true,
    identitySubmitLabel: 'ثبت و ارسال نهایی اطلاعات',
  },
  provincial_university: {
    showSecurityTab: true,
    showStatusAlerts: false,
    lockIdentityAfterSubmit: true,
    showDocUploader: true,
    identitySubmitLabel: 'ثبت و ارسال نهایی اطلاعات',
  },
  assistant_admin: {
    showSecurityTab: true,
    showStatusAlerts: false,
    lockIdentityAfterSubmit: true,
    showDocUploader: true,
    identitySubmitLabel: 'ثبت و ارسال نهایی اطلاعات',
  },
  central_organization: {
    showSecurityTab: true,
    showStatusAlerts: false,
    lockIdentityAfterSubmit: true,
    showDocUploader: true,
    identitySubmitLabel: 'ثبت و ارسال نهایی اطلاعات',
  },
  super_admin: {
    showSecurityTab: false,
    showStatusAlerts: false,
    lockIdentityAfterSubmit: false,
    showDocUploader: false,
    identitySubmitLabel: 'ذخیره تغییرات مشخصات سیستم',
  },
};

export interface ProfileContainerProps {
  role: string;
}

export function ProfileContainer({ role }: ProfileContainerProps) {
  return <ProfileContainerInner role={role} />;
}

function ProfileContainerInner({ role }: ProfileContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeUser = useUserStore((state) => state.activeUser);
  const session = AuthService.getSession();

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

  const uiStrategy = PROFILE_UI_STRATEGY[activeUser.role];
  const requestedTab = searchParams.get('tab');
  const activeTab: ProfileTab =
    requestedTab === 'security' && uiStrategy.showSecurityTab
      ? 'security'
      : 'identity';

  const handleTabChange = (value: string) => {
    const nextTab: ProfileTab = value === 'security' ? 'security' : 'identity';
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', nextTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const statusAlerts = uiStrategy.showStatusAlerts ? (
    <ProfileStatusAlert
      approved={activeUser.approved}
      docStatus={activeUser.docStatus}
      adminRequestMessage={activeUser.adminRequestMessage}
    />
  ) : null;

  const isProfileLocked =
    uiStrategy.lockIdentityAfterSubmit &&
    activeUser.docStatus !== 'not_submitted' &&
    activeUser.docStatus !== 'rejected';

  const identityForm = (
    <IdentityForm
      activeUser={activeUser}
      token={session?.token}
      disabled={isProfileLocked}
      statusAlerts={statusAlerts}
      showDocUploader={uiStrategy.showDocUploader}
      submitLabel={uiStrategy.identitySubmitLabel}
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
          className="gap-kv-stack"
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

          <AppTabsContent value="identity">{identityForm}</AppTabsContent>

          <AppTabsContent value="security">
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
  return (
    <div
      className="min-h-40 w-full bg-transparent"
      aria-busy="true"
      aria-live="polite"
    />
  );
}
